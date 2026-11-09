#!/usr/bin/env bash
# fix-rpf-skip.sh — One-shot fix for Calico cali-rpf-skip VXLAN drop on MicroK8s/AWS.
#
# Root cause:
#   Felix sets rp_filter=2 on vxlan.calico AND keeps cali-rpf-skip chain EMPTY.
#   The RPF validmark DROP rule in cali-FORWARD then drops ALL VXLAN cross-node
#   TCP packets (SYN-ACKs from worker never reach master pod).
#
# Fix:
#   Insert MARK 0x0/0x40000 at position 1 in cali-rpf-skip for vxlan.calico.
#   This clears the 0x40000 mark so the downstream DROP rule no longer fires.
#
# Usage:
#   # On master (run as root):
#   sudo bash scripts/fix-rpf-skip.sh master
#
#   # On worker via calico-node pod (no SSH needed):
#   microk8s.kubectl exec -n kube-system <calico-node-POD> -- \
#     bash /tmp/fix-rpf-skip.sh worker
#   # (copy this file to worker first with kubectl cp or pipe via stdin)
#
# Permanent fix: apply k8s/cluster/calico-rpf-fix-ds.yaml (DaemonSet that
#                re-inserts this rule every 30s after Felix resets it).

set -euo pipefail

ROLE="${1:-both}"
IPT="iptables-legacy"
command -v iptables-legacy &>/dev/null || IPT="iptables"

echo "=== fix-rpf-skip: role=$ROLE  ipt=$IPT ==="

# --------------------------------------------------------------------------
# Helper: insert rule only if not already present
# --------------------------------------------------------------------------
ensure_rule() {
  local table="$1"; shift
  local chain="$1"; shift
  if $IPT -t "$table" -C "$chain" "$@" 2>/dev/null; then
    echo "  [SKIP] already present: -t $table $chain $*"
  else
    $IPT -t "$table" -I "$chain" 1 "$@"
    echo "  [ADD]  inserted:        -t $table $chain $*"
  fi
}

# --------------------------------------------------------------------------
# 1. Wait for cali-rpf-skip chain to exist (Felix may still be starting)
# --------------------------------------------------------------------------
echo ""
echo "--- [1] Waiting for cali-rpf-skip chain ---"
for i in $(seq 1 12); do
  if $IPT -t raw -L cali-rpf-skip -n >/dev/null 2>&1; then
    echo "  chain ready (attempt $i)"
    break
  fi
  echo "  not ready yet, sleeping 5s... ($i/12)"
  sleep 5
done

if ! $IPT -t raw -L cali-rpf-skip -n >/dev/null 2>&1; then
  echo "  ERROR: cali-rpf-skip chain does not exist after 60s — is Calico running?"
  exit 1
fi

# --------------------------------------------------------------------------
# 2. Insert the MARK rule to bypass RPF check for vxlan.calico traffic
# --------------------------------------------------------------------------
echo ""
echo "--- [2] Inserting cali-rpf-skip rule ---"
ensure_rule raw cali-rpf-skip -i vxlan.calico -j MARK --set-xmark 0x0/0x40000

# --------------------------------------------------------------------------
# 3. Also set conntrack liberal mode (belt-and-braces for asymmetric TCP)
# --------------------------------------------------------------------------
echo ""
echo "--- [3] Setting nf_conntrack_tcp_be_liberal=1 ---"
if sysctl -w net.netfilter.nf_conntrack_tcp_be_liberal=1 2>/dev/null; then
  echo "  [OK] nf_conntrack_tcp_be_liberal=1"
else
  echo "  [WARN] could not set nf_conntrack_tcp_be_liberal (module not loaded?)"
fi

# Persist across reboots
SYSCTL_FILE="/etc/sysctl.d/99-calico-vxlan.conf"
if [[ -f "$SYSCTL_FILE" ]]; then
  grep -q "nf_conntrack_tcp_be_liberal" "$SYSCTL_FILE" 2>/dev/null || \
    echo "net.netfilter.nf_conntrack_tcp_be_liberal = 1" >> "$SYSCTL_FILE"
  echo "  [OK] persisted to $SYSCTL_FILE"
fi

# --------------------------------------------------------------------------
# 4. Show current state
# --------------------------------------------------------------------------
echo ""
echo "--- [4] cali-rpf-skip chain now ---"
$IPT -t raw -L cali-rpf-skip -n --line-numbers

echo ""
echo "--- [5] rp_filter values ---"
for iface in all default vxlan.calico; do
  key="net.ipv4.conf.${iface//./\/}.rp_filter"
  val=$(sysctl -n "$key" 2>/dev/null || cat "/proc/sys/net/ipv4/conf/${iface}/rp_filter" 2>/dev/null || echo "N/A")
  echo "  $key = $val"
done

echo ""
echo "=== Done. Now test immediately: ==="
echo "  microk8s.kubectl exec -n demo-app demo-app-68c9d74dbf-ld7p9 -- wget -qO- --timeout=5 http://10.1.48.78/"
