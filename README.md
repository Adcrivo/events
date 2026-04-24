# Adcrivo Events - Ad Event Tracking Service

A high-performance Node.js/TypeScript service for tracking ad events (clicks, impressions, etc.) using AWS SQS for asynchronous processing and Prisma for data persistence.

## Environments

| Environment | URL | Branch | Infrastructure |
|-------------|-----|--------|----------------|
| **Production** | [https://events.adcrivo.co](https://events.adcrivo.co) | `prod` | AWS Account (Prod) |
| **Development** | [https://dev.events.adcrivo.co](https://dev.events.adcrivo.co) | `main` | AWS Account (Dev) |

## Quick Start

### 1. Provision Infrastructure (Terraform)
Provision the AWS resources (SQS, SSM) for your environment:

```bash
cd infra/terraform

# For Dev
terraform init -backend-config=environments/dev.backend.hcl
terraform apply -var-file=environments/dev.tfvars

# For Prod
terraform init -reconfigure -backend-config=environments/prod.backend.hcl
terraform apply -var-file=environments/prod.tfvars
```

### 2. Configure DNS (GoDaddy)
Point your subdomain to the EC2 Public IP (shared with live service):
*   **Prod:** `events` → `PROD_IP`
*   **Dev:** `dev.events` → `DEV_IP`

### 3. Deploy Application (Ansible)
Deploy the latest code and configure Nginx/SSL:

```bash
cd infra/ansible
export GIT_PAT=your_github_token

# Deploy to Dev
ansible-playbook -i inventory/dev.ini playbooks/deploy.yml

# Deploy to Prod
ansible-playbook -i inventory/prod.ini playbooks/deploy.yml
```

## Monitoring & Logs

### Check Status
```bash
ansible all -i inventory/dev.ini -m shell -a "pm2 status" -b
```

### Application Logs (Console)
```bash
ansible all -i inventory/dev.ini -m shell -a "pm2 logs adcrivo-events --lines 50 --no-daemon" -b
```

### Server-Side File Logs
```bash
# Combined Logs
ansible all -i inventory/dev.ini -m shell -a "tail -n 100 /home/ubuntu/adcrivo-events/logs/app.log" -b

# Error Logs
ansible all -i inventory/dev.ini -m shell -a "tail -n 100 /home/ubuntu/adcrivo-events/logs/error.log" -b
```

## API Endpoints

All endpoints (except `/health`) require an `x-api-key` header.

- `GET /health` - Health check
- `POST /api/adEvent` - Track a new ad event (queued via SQS)
- `GET /api/adEvent/:adId` - Retrieve events for a specific ad
- `GET /api/adEvent/:adId/time-range` - Retrieve events within a time range

### Example Usage

```bash
# Track Event
curl -X POST https://dev.events.adcrivo.co/api/adEvent \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
  "adId": "test-ad-123",
  "userId": "test-user-456",
  "eventType": "click",
  "eventData": {
    "campaign": "spring-sale"
  }
}'
```

## Project Structure

*   `src/`: Application source code (TypeScript)
*   `src/sqs/`: SQS client and queue management
*   `src/services/adEvent.consumer.ts`: Background worker for processing events from SQS
*   `infra/terraform/`: Infrastructure as Code (SQS, SSM)
*   `infra/ansible/`: Configuration Management & Deployment
*   `ecosystem.config.js`: PM2 Process Management configuration

## Security
*   ✅ **HTTPS Enforcement:** Automatic HTTP → HTTPS redirection via Nginx.
*   ✅ **API Key Protection:** Middleware-secured endpoints.
*   ✅ **Asynchronous Processing:** SQS decouples API response from DB writes.
*   ✅ **SSM Integration:** Secrets and environment variables managed via AWS SSM Parameter Store.

---
*Last Updated: April 2026*