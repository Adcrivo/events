# ─────────────────────────────────────────────────────────────
# General
# ─────────────────────────────────────────────────────────────
variable "environment" {
  description = "Deployment environment (dev, prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "aws_profile" {
  description = "AWS CLI named profile"
  type        = string
}

# ─────────────────────────────────────────────────────────────
# Application Secrets
# ─────────────────────────────────────────────────────────────
variable "api_key" {
  description = "API Key for application authentication"
  type        = string
  sensitive   = true
}

variable "app_port" {
  description = "Port for the events service"
  type        = string
  default     = "8080"
}

variable "log_level" {
  description = "Logging level for the events service"
  type        = string
  default     = "info"
}
