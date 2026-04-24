resource "aws_sqs_queue" "ad_events_queue" {
  name                      = "adcrivo-ad-events-${var.environment}"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10

  tags = {
    Environment = var.environment
  }
}

output "queue_arn" { value = aws_sqs_queue.ad_events_queue.arn }
output "queue_url" { value = aws_sqs_queue.ad_events_queue.id }
