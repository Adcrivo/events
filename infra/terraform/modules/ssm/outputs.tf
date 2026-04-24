output "db_endpoint_param_name" {
  description = "SSM parameter name for database endpoint"
  value       = aws_ssm_parameter.db_endpoint.name
}

output "db_password_param_name" {
  description = "SSM parameter name for database password"
  value       = aws_ssm_parameter.db_password.name
}

output "sqs_queue_url_param_name" {
  description = "SSM parameter name for SQS queue URL"
  value       = aws_ssm_parameter.sqs_queue_url.name
}

output "app_environment_param_name" {
  description = "SSM parameter name for app environment"
  value       = aws_ssm_parameter.app_environment.name
}

output "parameter_names" {
  description = "All parameter names created"
  value = [
    aws_ssm_parameter.db_endpoint.name,
    aws_ssm_parameter.db_port.name,
    aws_ssm_parameter.db_name.name,
    aws_ssm_parameter.db_username.name,
    aws_ssm_parameter.db_password.name,
    aws_ssm_parameter.sqs_queue_url.name,
    aws_ssm_parameter.app_environment.name,
    aws_ssm_parameter.node_env.name,
    aws_ssm_parameter.api_key.name
  ]
}

output "api_key_param_name" {
  description = "SSM parameter name for API key"
  value       = aws_ssm_parameter.api_key.name
}

output "ec2_instance_profile_name" {
  description = "Name of the EC2 IAM instance profile"
  value       = aws_iam_instance_profile.ec2_profile.name
}
