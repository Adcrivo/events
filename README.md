# Adcrivo Events - Ad Event Tracking Service

A high-performance Node.js/TypeScript service for tracking ad events (clicks, impressions, etc.) using AWS SQS for asynchronous processing and Prisma for data persistence.

## Environments

| Environment | URL | Branch | Infrastructure |
|-------------|-----|--------|----------------|
| **Production** | [https://events.adcrivo.co](https://events.adcrivo.co) | `prod` | AWS Account (Prod) |
| **Development** | [https://dev.events.adcrivo.co](https://dev.events.adcrivo.co) | `main` | AWS Account (Dev) |

## Quick Start

### 1. Provision Infrastructure (Terraform)
Provision the environment-specific SQS queues and SSM parameters:

```bash
cd infra/terraform

# For Dev
terraform init -backend-config=environments/dev.backend.hcl
terraform apply -var-file=environments/dev.tfvars

# For Prod
terraform init -backend-config=environments/prod.backend.hcl
terraform apply -var-file=environments/prod.tfvars
```

### 2. Configure DNS (GoDaddy)
Point your subdomain to the shared EC2 Public IP:
*   **IP Address:** `3.6.76.128` (Standardized production IP)
*   **Record:** `events` → `3.6.76.128`

### 3. Deploy Application (Ansible)
Deploy the latest code and configure Nginx/SSL. This service is co-located with the `live` service on the same EC2 instance.

```bash
cd infra/ansible
export GIT_PAT=your_github_token

# 1. Initial Setup (Nginx, SSL, System Deps)
# Note: Ensure DNS is pointed before running setup for SSL to work
ansible-playbook -i inventory/prod.ini playbooks/setup.yml

# 2. Deploy/Update Application
ansible-playbook -i inventory/prod.ini playbooks/deploy.yml
```

## Deployment Flow (Production)

The deployment flow is standardized across Adcrivo services:
1.  **Infrastructure**: Provision SQS and SSM parameters via Terraform.
2.  **Shared DB**: The deployment clones the `adcrivo-db` repository into the parent directory on the server to provide the unified Prisma client.
3.  **Secrets Management**: Environment variables are fetched from AWS SSM Parameter Store at application startup (`/ADCRIVO-EVENTS/PROD/*` and `/ADCRIVO-DB/PROD/*`).
4.  **Process Management**: PM2 manages the application process (`events-service`).
5.  **Reverse Proxy**: Nginx handles SSL termination via Let's Encrypt (Certbot) and proxies requests to port `8080`.

## Monitoring & Logs

### Check Status
```bash
ansible all -i inventory/prod.ini -m shell -a "pm2 status" -b
```

### Application Logs (PM2)
```bash
ansible all -i inventory/prod.ini -m shell -a "pm2 logs events --lines 50" -b
```

### Server-Side File Logs
```bash
# Combined Logs
ansible all -i inventory/prod.ini -m shell -a "tail -n 100 /home/ubuntu/adcrivo-events/logs/app.log" -b
```

## Security
*   ✅ **HTTPS Enforcement:** Automatic HTTP → HTTPS redirection via Nginx.
*   ✅ **IAM-based Secrets:** EC2 instance uses an IAM role to securely fetch SSM parameters.
*   ✅ **Shared Data Layer:** Uses the unified `@adcrivo/db` package for schema consistency.

---
*Last Updated: 2026-04-24*