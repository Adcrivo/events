# Infrastructure Deployment

This directory contains Terraform and Ansible configurations for deploying the Adcrivo Events application to AWS.

## Prerequisites

- AWS CLI configured with credentials
- Terraform installed
- Ansible installed
- SSH access to EC2 instances

## Configuration Files

### 1. Terraform Configuration (`terraform/terraform.tfvars`)

Create this file from the example:
```bash
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
```

Edit with your values:
```hcl
aws_region  = "ap-south-1"
environment = "dev"
db_username = "your_db_username"
db_password = "your_secure_password"
db_name     = "your_database_name"
```

### 2. Domain Configuration (`domain.conf`)

Create this file from the example:
```bash
cp domain.conf.example domain.conf
```

Edit with your domain settings:
```bash
# For HTTPS deployment with SSL
domain_name=events.adcrivo.co
ssl_email=your@email.com

# For HTTP-only deployment (no SSL)
domain_name=
ssl_email=
```

**Note:** This file is gitignored to keep your domain configuration private.

## Deployment

### Quick Deploy

Simply run the deploy script:
```bash
./deploy.sh
```

The script will:
1. ✅ Read domain configuration from `domain.conf` (no prompts needed!)
2. ✅ Apply Terraform configuration
3. ✅ Create Ansible inventory with all variables
4. ✅ Run Ansible playbook to configure the server
5. ✅ Set up SSL certificate if domain is configured
6. ✅ Deploy the application with PM2

### First Time Setup

If `domain.conf` doesn't exist, the script will prompt you for domain settings and suggest creating the file for future deployments.

## Infrastructure Components

### Terraform Provisions:
- EC2 instance (t2.micro - Free Tier)
- RDS PostgreSQL database (db.t3.micro - Free Tier)
- SQS queue for event processing
- Security groups and networking
- SSH key pair

### Ansible Configures:
- Node.js 18.x installation
- PM2 process manager
- Nginx reverse proxy
- SSL certificate via Certbot (if domain configured)
- Application deployment from GitHub
- Environment variables and secrets

## Destroy Infrastructure

To tear down all AWS resources:
```bash
cd terraform
terraform destroy -auto-approve
```

## Troubleshooting

### Domain/SSL Issues
- Ensure your domain DNS is pointing to the EC2 IP address
- Check `domain.conf` has correct values
- Verify SSL email is valid
- Check Certbot logs: `sudo certbot certificates`

### Deployment Issues
- Check Ansible logs during deployment
- SSH into server: `ssh -i terraform/events-key.pem ubuntu@<EC2_IP>`
- Check PM2 logs: `pm2 logs`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

## File Structure

```
infra/
├── deploy.sh                    # Main deployment script
├── domain.conf                  # Your domain configuration (gitignored)
├── domain.conf.example          # Example domain configuration
├── terraform/
│   ├── main.tf                  # Terraform main configuration
│   ├── terraform.tfvars         # Your Terraform variables (gitignored)
│   └── terraform.tfvars.example # Example Terraform variables
└── ansible/
    ├── playbook.yml             # Ansible playbook
    └── inventory.ini            # Generated inventory (gitignored)
```

## Security Notes

- `terraform.tfvars` - Contains database credentials (gitignored)
- `domain.conf` - Contains domain configuration (gitignored)
- `inventory.ini` - Generated with sensitive data (gitignored)
- `*.pem` - SSH private keys (gitignored)

Never commit these files to version control!
