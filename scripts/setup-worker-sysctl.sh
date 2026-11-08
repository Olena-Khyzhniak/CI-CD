#!/usr/bin/env bash
# setup-worker-sysctl.sh
# Makes rp_filter=0 persistent on the worker node for Calico VXLAN.
#
# Problem: Calico VXLAN requires rp_filter=0 on vxlan.calico and all pod veth
# interfaces. On AWS the default is rp_filter=1 (strict), which drops
# cross-node pod packets after VXLAN decapsulation because the reverse-path
# check fails for asymmetric routes.
#
# This script must be run ONCE on the WORKER node (cicd-worker) as root:
#   sudo bash scripts/setup-worker-sysctl.sh
#
# It writes /etc/sysctl.d/99-calico-vxlan.conf so the setting survives reboots.
# Calico Felix (with AWSSrcDstCheck=Disable in calico-felixconfig.yaml) will
# also maintain rp_filter=0 at runtime, but the sysctl file is a belt-and-braces
# fallback for the window between node boot and Felix becoming ready.

set -euo pipefail

SYSCTL_FILE="/etc/sysctl.d/99-calico-vxlan.conf"

echo "=== Writing $SYSCTL_FILE ==="
cat > "$SYSCTL_FILE" << 'EOF'
# Calico VXLAN: disable strict reverse-path filter on all interfaces.
# Required for cross-node pod traffic on AWS EC2 with asymmetric routing.
# See: https://docs.tigera.io/calico/latest/reference/resources/felixconfig
net.ipv4.conf.all.rp_filter = 0
net.ipv4.conf.default.rp_filter = 0
EOF

echo "=== Applying immediately ==="
sysctl -p "$SYSCTL_FILE"

# Also set on vxlan.calico right now if it already exists
if ip link show vxlan.calico &>/dev/null; then
  echo "=== Setting rp_filter=0 on vxlan.calico now ==="
  sysctl -w net.ipv4.conf.vxlan/calico.rp_filter=0 || \
    echo 0 > /proc/sys/net/ipv4/conf/vxlan.calico/rp_filter
fi

echo "=== Done. Current values: ==="
sysctl net.ipv4.conf.all.rp_filter net.ipv4.conf.default.rp_filter
