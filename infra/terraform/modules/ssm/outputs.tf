# ─────────────────────────────────────────────────────────────
# SSM Parameter Names
# ─────────────────────────────────────────────────────────────

output "sqs_queue_url_param_name" {
  description = "SSM parameter name for SQS queue URL"
  value       = aws_ssm_parameter.sqs_queue_url.name
}

output "app_environment_param_name" {
  description = "SSM parameter name for app environment"
  value       = aws_ssm_parameter.app_environment.name
}

output "api_key_param_name" {
  description = "SSM parameter name for API key"
  value       = aws_ssm_parameter.api_key.name
}

output "node_env_param_name" {
  description = "SSM parameter name for Node environment"
  value       = aws_ssm_parameter.node_env.name
}

output "port_param_name" {
  description = "SSM parameter name for app port"
  value       = aws_ssm_parameter.port.name
}

output "log_level_param_name" {
  description = "SSM parameter name for log level"
  value       = aws_ssm_parameter.log_level.name
}

output "parameter_names" {
  description = "All parameter names created"
  value = [
    aws_ssm_parameter.sqs_queue_url.name,
    aws_ssm_parameter.app_environment.name,
    aws_ssm_parameter.api_key.name,
    aws_ssm_parameter.node_env.name,
    aws_ssm_parameter.port.name,
    aws_ssm_parameter.log_level.name
  ]
}
