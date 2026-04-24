# ─────────────────────────────────────────────────────────────
# SQS Outputs
# ─────────────────────────────────────────────────────────────
output "sqs_queue_url" {
  description = "The URL of the SQS queue for ad events"
  value       = module.sqs.queue_url
}

output "sqs_queue_arn" {
  description = "The ARN of the SQS queue for ad events"
  value       = module.sqs.queue_arn
}

# ─────────────────────────────────────────────────────────────
# Environment Info
# ─────────────────────────────────────────────────────────────
output "environment" {
  value = var.environment
}
