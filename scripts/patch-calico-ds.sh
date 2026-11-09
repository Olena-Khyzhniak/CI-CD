#!/bin/bash
# patch-calico-ds.sh — Add FELIX_IGNORELOOSERPF=true to calico-node DaemonSet
# This is the official way to stop Felix from enforcing rp_filter sysctl
# in iptables mode (ref: https://github.com/projectcalico/felix config.py)

KUBECTL="microk8s.kubectl"

# Check if already patched
if $KUBECTL get ds calico-node -n kube-system -o yaml 2>/dev/null | grep -q FELIX_IGNORELOOSERPF; then
  echo "Already patched — FELIX_IGNORELOOSERPF already in DaemonSet"
  exit 0
fi

cat <<'EOF' > /tmp/calico-ds-patch.json
{"spec":{"template":{"spec":{"containers":[{"name":"calico-node","env":[{"name":"FELIX_IGNORELOOSERPF","value":"true"}]}]}}}}
EOF

$KUBECTL patch ds calico-node -n kube-system \
  --type=strategic \
  --patch "$(cat /tmp/calico-ds-patch.json)" && echo "Patched OK"

echo ""
echo "Waiting for rollout..."
$KUBECTL rollout status ds/calico-node -n kube-system --timeout=120s
echo "Done"
