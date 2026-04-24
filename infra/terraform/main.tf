# ─────────────────────────────────────────────────────────────
# Provider
# ─────────────────────────────────────────────────────────────
provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Project     = "Adcrivo-Events"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ─────────────────────────────────────────────────────────────
# SQS  —  Queue
# ─────────────────────────────────────────────────────────────
module "sqs" {
  source = "./modules/sqs"

  environment = var.environment
}

# ─────────────────────────────────────────────────────────────
# SSM  —  Parameters for Events Service
# ─────────────────────────────────────────────────────────────
# Note: Database parameters are now managed in the adcrivo-db repository.
# Note: Shared EC2 role from live service will be updated to include permissions for these parameters.
module "ssm" {
  source = "./modules/ssm"

  environment       = var.environment
  sqs_queue_url     = module.sqs.queue_url
  sqs_queue_arn     = module.sqs.queue_arn
  api_key           = var.api_key
  node_env          = var.environment == "prod" ? "production" : "development"
  app_port          = var.app_port
  log_level         = var.log_level
}
