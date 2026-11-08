#!/usr/bin/env bash
# apply-cluster-patches.sh
# Applies cluster-wide fixes for cross-node DNS and Calico rp_filter.
# Called from .github/workflows/ci-cd.yaml on every deploy.
# Safe to run multiple times (idempotent).

set -euo pipefail
KUBECTL="microk8s kubectl"

echo "=== [1/3] FelixConfiguration: awsSrcDstCheck=Disable ==="
$KUBECTL apply -f k8s/cluster/calico-felixconfig.yaml

echo ""
echo "=== [2/3] CoreDNS Deployment: replicas=2 + anti-affinity ==="
$KUBECTL scale deployment coredns -n kube-system --replicas=2

$KUBECTL patch deployment coredns -n kube-system --type=strategic -p '
{
  "spec": {
    "template": {
      "spec": {
        "affinity": {
          "podAntiAffinity": {
            "requiredDuringSchedulingIgnoredDuringExecution": [{
              "labelSelector": {
                "matchExpressions": [{
                  "key": "k8s-app",
                  "operator": "In",
                  "values": ["kube-dns"]
                }]
              },
              "topologyKey": "kubernetes.io/hostname"
            }]
          }
        }
      }
    }
  }
}'

echo ""
echo "=== [3/3] kube-dns Service: internalTrafficPolicy=Local ==="
$KUBECTL patch service kube-dns -n kube-system --type=merge \
  -p '{"spec":{"internalTrafficPolicy":"Local"}}'

echo ""
echo "=== Done. Verifying: ==="
$KUBECTL get deployment coredns -n kube-system \
  -o jsonpath='CoreDNS replicas={.spec.replicas}{"\n"}'
$KUBECTL get service kube-dns -n kube-system \
  -o jsonpath='kube-dns internalTrafficPolicy={.spec.internalTrafficPolicy}{"\n"}'
$KUBECTL get felixconfiguration default \
  -o jsonpath='Felix awsSrcDstCheck={.spec.awsSrcDstCheck}{"\n"}'
