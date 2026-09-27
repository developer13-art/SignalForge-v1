# =============================================================
# SignalForge — Terraform Outputs
# =============================================================

output "vpc_id" {
  description = "ID of the created VPC."
  value       = module.networking.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of public subnets."
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of private subnets."
  value       = module.networking.private_subnet_ids
}

output "database_endpoint" {
  description = "RDS PostgreSQL endpoint."
  value       = module.database.endpoint
  sensitive   = true
}

output "database_port" {
  description = "RDS PostgreSQL port."
  value       = module.database.port
}

output "database_name" {
  description = "Name of the PostgreSQL database."
  value       = module.database.database_name
}

output "database_secret_arn" {
  description = "ARN of the Secrets Manager secret holding DB credentials."
  value       = module.database.secret_arn
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster."
  value       = module.compute.cluster_name
}

output "ecs_service_name" {
  description = "Name of the ECS service."
  value       = module.compute.service_name
}

output "load_balancer_dns" {
  description = "DNS name of the Application Load Balancer."
  value       = module.compute.alb_dns_name
}

output "load_balancer_zone_id" {
  description = "Hosted zone ID of the Application Load Balancer."
  value       = module.compute.alb_zone_id
}

output "s3_kyc_bucket" {
  description = "Name of the private S3 bucket for KYC documents."
  value       = module.storage.kyc_bucket_name
}

output "s3_media_bucket" {
  description = "Name of the S3 bucket for public media."
  value       = module.storage.media_bucket_name
}

output "cloudwatch_log_group" {
  description = "Name of the CloudWatch log group for the server."
  value       = module.monitoring.log_group_name
}

output "app_url" {
  description = "Public URL of the application."
  value       = "https://${var.app_subdomain}.${var.domain_name}"
}

output "api_url" {
  description = "Public URL of the API."
  value       = "https://${var.api_subdomain}.${var.domain_name}"
}