resource "aws_ssm_parameter" "sqs_queue_url" {
  name        = "/adcrivo-events/${var.environment}/SQS_QUEUE_URL"
  type        = "String"
  value       = var.sqs_queue_url
  overwrite   = true
}

resource "aws_ssm_parameter" "app_environment" {
  name        = "/adcrivo-events/${var.environment}/ENVIRONMENT"
  type        = "String"
  value       = var.environment
  overwrite   = true
}

resource "aws_ssm_parameter" "api_key" {
  name        = "/adcrivo-events/${var.environment}/API_KEY"
  type        = "SecureString"
  value       = var.api_key
  overwrite   = true
}

resource "aws_ssm_parameter" "node_env" {
  name        = "/adcrivo-events/${var.environment}/NODE_ENV"
  type        = "String"
  value       = var.node_env
  overwrite   = true
}

resource "aws_ssm_parameter" "port" {
  name        = "/adcrivo-events/${var.environment}/PORT"
  type        = "String"
  value       = var.app_port
  overwrite   = true
}

resource "aws_ssm_parameter" "log_level" {
  name        = "/adcrivo-events/${var.environment}/LOG_LEVEL"
  type        = "String"
  value       = var.log_level
  overwrite   = true
}
