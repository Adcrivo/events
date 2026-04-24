output "ec2_public_ip" {
  value = module.compute.app_server_public_ip
}

output "db_endpoint" {
  value = module.database.db_endpoint
}

output "sqs_queue_url" {
  value = module.sqs.queue_url
}
