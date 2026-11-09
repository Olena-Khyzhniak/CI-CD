#!/bin/bash
# fix-and-test.sh — Apply rpf-skip + CT rules on both nodes, then test TCP immediately.
# Run on master as root: sudo bash /tmp/fix-and-test.sh
set -e
KUBECTL="microk8s.kubectl"
IPT="iptables-legacy"
MASTER_POD="demo-app-68c9d74dbf-ld7p9"
WORKER_POD_IP="10.1.48.78"
CALICO_WORKER="calico-node-q9fsb"
MASTER_CIDR="10.1.35.0/26"
WORKER_CIDR="10.1.48.0/26"

echo "=== [1] MASTER: cali-rpf-skip ==="
$IPT -t raw -L cali-rpf-skip -n --line-numbers

echo ""
echo "=== [2] MASTER: applying rpf-skip rule ==="
if $IPT -t raw -C cali-rpf-skip -i vxlan.calico -j MARK --set-xmark 0x0/0x40000 2>/dev/null; then
  echo "  already present"
else
  $IPT -t raw -I cali-rpf-skip 1 -i vxlan.calico -j MARK --set-xmark 0x0/0x40000
  echo "  inserted"
fi

echo ""
echo "=== [3] MASTER: CT rules for cross-node traffic ==="
if $IPT -t raw -C PREROUTING -i vxlan.calico -s $WORKER_CIDR -d $MASTER_CIDR -j CT 2>/dev/null; then
  echo "  CT rule already present"
else
  $IPT -t raw -I PREROUTING 1 -i vxlan.calico -s $WORKER_CIDR -d $MASTER_CIDR -j CT
  echo "  CT rule inserted"
fi

echo ""
echo "=== [4] WORKER: applying rpf-skip rule ==="
if $KUBECTL exec -n kube-system $CALICO_WORKER -- \
    $IPT -t raw -C cali-rpf-skip -i vxlan.calico -j MARK --set-xmark 0x0/0x40000 2>/dev/null; then
  echo "  already present"
else
  $KUBECTL exec -n kube-system $CALICO_WORKER -- \
    $IPT -t raw -I cali-rpf-skip 1 -i vxlan.calico -j MARK --set-xmark 0x0/0x40000
  echo "  inserted"
fi

echo ""
echo "=== [5] WORKER: CT rules for cross-node traffic ==="
if $KUBECTL exec -n kube-system $CALICO_WORKER -- \
    $IPT -t raw -C PREROUTING -i vxlan.calico -s $MASTER_CIDR -d $WORKER_CIDR -j CT 2>/dev/null; then
  echo "  CT rule already present"
else
  $KUBECTL exec -n kube-system $CALICO_WORKER -- \
    $IPT -t raw -I PREROUTING 1 -i vxlan.calico -s $MASTER_CIDR -d $WORKER_CIDR -j CT
  echo "  CT rule inserted"
fi

echo ""
echo "=== [6] WORKER: be_liberal ==="
$KUBECTL exec -n kube-system $CALICO_WORKER -- \
  sysctl -w net.netfilter.nf_conntrack_tcp_be_liberal=1 2>/dev/null || echo "  skipped"

echo ""
echo "=== [7] nf_conntrack_tcp_be_liberal on MASTER ==="
sysctl -w net.netfilter.nf_conntrack_tcp_be_liberal=1

echo ""
echo "=== [8] TEST TCP - wget master pod -> worker pod ==="
for i in 1 2 3; do
  echo "  attempt $i:"
  $KUBECTL exec -n demo-app $MASTER_POD -- wget -qO- --timeout=4 http://$WORKER_POD_IP/ 2>&1 | head -3 && echo "  SUCCESS!" && break || echo "  failed"
  sleep 1
done

echo ""
echo "=== [9] conntrack entries for worker pod ==="
conntrack -L 2>/dev/null | grep "10.1.48" | head -10 || echo "  (no conntrack CLI)"

echo ""
echo "=== [10] WORKER cali-rpf-skip (final state) ==="
$KUBECTL exec -n kube-system $CALICO_WORKER -- \
  $IPT -t raw -L cali-rpf-skip -n --line-numbers 2>/dev/null
