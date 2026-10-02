# CI-CD
Rolling Update Demo: Cloud Native CI/CD Pipeline

The main goal of the project is to deploy a highly available application on a Kubernetes cluster.


**TODO:**
- k8s/demo-app/deployment.yaml => image: demo-app:v1        # TODO: update to ECR URL!!! But it can be unchanged as I use ci-cd.yaml set ECR_REGISTRY automatically. 



**Pipepline flow:**
push git tag v2.0.0 -> GitHub Actions starts -> build-and-push job: docker build -> push to ECR ->
deploy job: kubectl apply -f k8s/demo-app/deployment.yaml (SSH EC2 + kubectl apply all yaml files) -> rolling update of demo-app:v1 to demo-app:v2 -> browser white background changes to BLACK one
