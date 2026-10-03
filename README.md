# CI-CD
Rolling Update Demo: Cloud Native CI/CD Pipeline

The main goal of the project is to deploy a highly available application on a Kubernetes cluster.


**TODO:**
- k8s/demo-app/deployment.yaml => image: demo-app:v1        # TODO: update to ECR URL!!! But it can be unchanged as I use ci-cd.yaml set ECR_REGISTRY automatically. 



**Pipepline flow:**
push git tag v2.0.0 -> GitHub Actions starts -> build-and-push job: docker build -> push to ECR ->
deploy job: kubectl apply -f k8s/demo-app/deployment.yaml (SSH EC2 + kubectl apply all yaml files) -> rolling update of demo-app:v1 to demo-app:v2 -> browser white background changes to BLACK one


# AWS EC2 + MicroK8s + CI/CD Setup

## 1. AWS Console

### Master EC2

* Ubuntu 22.04
* Instance type: `t3.large`
* Key pair: `your-key`
* Security Group: `cicd-sg`
* Name: `cicd-master`

### Worker EC2

* Ubuntu 22.04
* Instance type: `t3.large`
* Key pair: `your-key`
* Security Group: `cicd-sg`
* Name: `cicd-worker`

---

# 2. SSH to MASTER

```bash
ssh -i <your-key.pem-path> ubuntu@<MASTER_PUBLIC_IP>
```

## Install MicroK8s

```bash
sudo snap install microk8s --classic
```

## Clone repository

```bash
git clone <your repo>
cd CI-CD
```

## Run master setup script

```bash
chmod +x scripts/setup-master.sh
./scripts/setup-master.sh
```

## Configure AWS CLI

```bash
aws configure
```

Enter the AWS credentials manually:

```text
AWS Access Key ID:
AWS Secret Access Key:
Default region name:
Default output format:
```

## Install Istio

Install Istio manually if it is not already included in the setup script.

---

# 3. SSH to WORKER

```bash
ssh -i <your-key.pem-path> ubuntu@<WORKER_PUBLIC_IP>
```

## Install MicroK8s

```bash
sudo snap install microk8s --classic
```

## Clone repository

```bash
git clone <your repo>
cd CI-CD
```

## Run worker setup script

```bash
chmod +x scripts/setup-worker.sh
./scripts/setup-worker.sh
```

---

# 4. Join WORKER to MASTER

## On MASTER

```bash
microk8s add-node
```

Copy the join command that MicroK8s displays.

It will look similar to:

```bash
microk8s join <MASTER_IP>:25000/<TOKEN> --worker
```

## On WORKER

Paste and run the join command:

```bash
microk8s join <MASTER_IP>:25000/<TOKEN> --worker
```

---

# 5. Check Kubernetes cluster

## On MASTER

```bash
k get nodes
```

or:

```bash
microk8s kubectl get nodes
```

Both nodes should appear.

Expected structure:

```text
NAME           STATUS   ROLES
cicd-master    Ready    <...>
cicd-worker    Ready    <...>
```

---

# 6. Trigger CI/CD deployment

Make sure the required changes are pushed to GitHub.

Create a Git tag from `origin/main`:

```bash
git fetch origin
git tag v1.0.0 origin/main
git push origin v1.0.0
```

The GitHub Actions workflow is triggered by the `v*` tag.

For example:

```text
v1.0.0
v1.0.1
v2.0.0
```

The pipeline will:

1. Build the Docker image.
2. Push the image to AWS ECR.
3. Connect to the EC2 master via SSH.
4. Apply the Kubernetes manifests.
5. Update the deployment image.
6. Wait for the Kubernetes rollout to complete.

---

# Important

Do not change Git branches on the EC2 instance just because the repository contains the setup scripts.

If the scripts are already on the branch you cloned, simply:

```bash
git pull
```

is enough to update the EC2 copy.

