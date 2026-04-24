variable "environment" {
  description = "Environment name (dev, prod)"
  type        = string
}

variable "sqs_queue_url" {
  description = "SQS Queue URL"
  type        = string
}

variable "node_env" {
  description = "Node.js environment (development, production)"
  type        = string
  default     = "production"
}

variable "api_key" {
  description = "API Key for application"
  type        = string
  sensitive   = true
}

variable "sqs_queue_arn" {
  description = "ARN of the SQS queue for IAM policy"
  type        = string
}

variable "app_port" {
  description = "Application port"
  type        = string
  default     = "8080"
}

variable "log_level" {
  description = "Application log level"
  type        = string
  default     = "info"
}

variable "database_url" {
  description = "Full Database URL"
  type        = string
  sensitive   = true
}
