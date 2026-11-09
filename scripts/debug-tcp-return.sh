#!/usr/bin/env bash
# debug-tcp-return.sh — Diagnose cross-node TCP return path (SYN-ACK worker→master).
#
# Usage: sudo bash scripts/debug-tcp-return.sh
#
# Run on MASTER after applying fix-rpf-skip.sh on BOTH nodes.
# Starts tcpdump on master vxlan.calico, fires wget from master pod,
# and shows whether SYN-ACK from worker ever arrives on master.
#
# Expected result (working):
#   vxlan.calico: SYN   10.1.35.171 → 10.1.48.78:80  (master pod → worker pod)
#   vxlan.calico: SYN-ACK 10.1.48.78:80 → 10.1.35.171  (worker reply arrives ✅)
#
# Broken result:
#   Only SYN seen, no SYN-ACK → reply path still broken (RPF drop on master or worker)

set -euo pipefail

KUBECTL="microk8s.kubectl"
MASTER_POD="demo-app-68c9d74dbf-ld7p9"
WORKER_POD_IP="10.1.48.78"
MASTER_POD_IP="10.1.35.171"
CALICO_WORKER="calico-node-q9fsb"
TIMEOUT=8

echo "======================================================="
echo " TCP Return Path Diagnostic"
echo " $(date -u)"
echo "======================================================="

# --------------------------------------------------------------------------
# 0. Show iptables state on both nodes
# --------------------------------------------------------------------------
echo ""
echo "--- [0a] MASTER cali-rpf-skip ---"
iptables-legacy -t raw -L cali-rpf-skip -n --line-numbers 2>/dev/null || \
  iptables -t raw -L cali-rpf-skip -n --line-numbers 2>/dev/null || \
  echo "  (chain not found)"

echo ""
echo "--- [0b] WORKER cali-rpf-skip ---"
$KUBECTL exec -n kube-system "$CALICO_WORKER" -- \
  iptables-legacy -t raw -L cali-rpf-skip -n --line-numbers 2>/dev/null || echo "  (exec failed)"

echo ""
echo "--- [0c] MASTER rp_filter ---"
for f in all default; do
  echo "  net.ipv4.conf.$f.rp_filter = $(cat /proc/sys/net/ipv4/conf/$f/rp_filter 2>/dev/null)"
done
if [[ -f /proc/sys/net/ipv4/conf/vxlan.calico/rp_filter ]]; then
  echo "  net.ipv4.conf.vxlan.calico.rp_filter = $(cat /proc/sys/net/ipv4/conf/vxlan.calico/rp_filter)"
fi

echo ""
echo "--- [0d] WORKER rp_filter ---"
$KUBECTL exec -n kube-system "$CALICO_WORKER" -- \
  sh -c "for f in all default; do echo \"  net.ipv4.conf.\$f.rp_filter = \$(cat /proc/sys/net/ipv4/conf/\$f/rp_filter 2>/dev/null)\"; done; \
         [ -f /proc/sys/net/ipv4/conf/vxlan.calico/rp_filter ] && \
           echo \"  net.ipv4.conf.vxlan.calico.rp_filter = \$(cat /proc/sys/net/ipv4/conf/vxlan.calico/rp_filter)\"" 2>/dev/null || echo "  (exec failed)"

# --------------------------------------------------------------------------
# 1. MASTER: start tcpdump on vxlan.calico watching SYN/SYN-ACK
# --------------------------------------------------------------------------
echo ""
echo "--- [1] Starting tcpdump on MASTER vxlan.calico (${TIMEOUT}s) ---"
echo "    Filter: host $WORKER_POD_IP and tcp port 80"

tcpdump -i vxlan.calico -n \
  "host $WORKER_POD_IP and tcp port 80" \
  -c 30 -w /tmp/tcp-return-master.pcap 2>/tmp/tcpdump-master.log &
DUMP_PID=$!
echo "  tcpdump PID: $DUMP_PID"
sleep 1

# --------------------------------------------------------------------------
# 2. WORKER: also start tcpdump via calico-node (background)
# --------------------------------------------------------------------------
echo ""
echo "--- [2] Starting tcpdump on WORKER vxlan.calico (${TIMEOUT}s) ---"
$KUBECTL exec -n kube-system "$CALICO_WORKER" -- \
  sh -c "timeout $TIMEOUT tcpdump -i vxlan.calico -n \
    'host $WORKER_POD_IP and tcp port 80' -c 30 2>&1 || true" &
WORKER_DUMP_PID=$!

sleep 1

# --------------------------------------------------------------------------
# 3. Fire wget from master pod
# --------------------------------------------------------------------------
echo ""
echo "--- [3] wget from master pod $MASTER_POD → $WORKER_POD_IP:80 ---"
for attempt in 1 2 3; do
  echo "  attempt $attempt:"
  $KUBECTL exec -n demo-app "$MASTER_POD" -- \
    sh -c "wget -qO- --timeout=4 http://$WORKER_POD_IP/ 2>&1 | head -3 || echo '  TIMEOUT/FAIL'" \
    2>&1 | sed 's/^/    /'
  sleep 1
done

# --------------------------------------------------------------------------
# 4. Wait for captures and show results
# --------------------------------------------------------------------------
echo ""
echo "--- [4] Waiting for captures to finish ---"
wait $WORKER_DUMP_PID 2>/dev/null || true
kill $DUMP_PID 2>/dev/null || true
wait $DUMP_PID 2>/dev/null || true

echo ""
echo "--- [5] MASTER vxlan.calico capture (text) ---"
tcpdump -r /tmp/tcp-return-master.pcap -n 2>/dev/null | head -30 || \
  cat /tmp/tcpdump-master.log | head -30

# --------------------------------------------------------------------------
# 5. conntrack state
# --------------------------------------------------------------------------
echo ""
echo "--- [6] conntrack entries for $WORKER_POD_IP ---"
conntrack -L 2>/dev/null | grep "$WORKER_POD_IP" | head -20 || \
  cat /proc/net/nf_conntrack 2>/dev/null | awk -v ip="$WORKER_POD_IP" '$0~ip' | head -10 || \
  echo "  (conntrack CLI not available)"

echo ""
echo "--- [7] nf_conntrack_tcp_be_liberal ---"
cat /proc/sys/net/netfilter/nf_conntrack_tcp_be_liberal 2>/dev/null || echo "  (not set)"

echo ""
echo "======================================================="
echo " INTERPRETATION:"
echo "  [3] wget SUCCESS + [5] SYN-ACK seen  → TCP fully working ✅"
echo "  [3] TIMEOUT + [5] only SYN           → reply path still broken on MASTER"
echo "  [3] TIMEOUT + [5] nothing            → SYN never left master (routing issue)"
echo "  [3] TIMEOUT + [5] SYN-ACK seen       → iptables FORWARD drop on master"
echo "======================================================="
echo "Done: $(date -u)"
