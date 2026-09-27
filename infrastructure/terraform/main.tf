# =============================================================
# SignalForge — Terraform Root Module
# =============================================================
# Provisions the full production infrastructure on AWS:
#   - Networking (VPC, subnets, NAT, security groups)
#   - Database (RDS PostgreSQL Multi-AZ)
#   - Compute (ECS Fargate + Application Load Balancer)
#   - Storage (S3 buckets for KYC documents and public media)
#   - Secrets (Secrets Manager for sensitive values)
#   - Monitoring (CloudWatch logs and alarms)
# =============================================================

module "networking" {
  source = "./modules/networking"

  project_name         = var.project_name
  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  availability_zones   = var.availability_zones
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

module "storage" {
  source = "./modules/storage"

  project_name = var.project_name
  environment  = var.environment
}

module "secrets" {
  source = "./modules/secrets"

  project_name = var.project_name
  environment  = var.environment

  db_username  = var.db_username
  db_password  = var.db_password
  db_endpoint  = module.database.endpoint
  db_port      = module.database.port
  db_name      = var.db_name
}

module "database" {
  source = "./modules/database"

  project_name            = var.project_name
  environment             = var.environment
  vpc_id                  = module.networking.vpc_id
  private_subnet_ids      = module.networking.private_subnet_ids
  database_security_group = module.networking.database_security_group_id
  instance_class          = var.db_instance_class
  allocated_storage       = var.db_allocated_storage
  max_allocated_storage   = var.db_max_allocated_storage
  database_name           = var.db_name
  database_username       = var.db_username
  database_password       = var.db_password
  multi_az                = var.db_multi_az
  backup_retention_days   = var.db_backup_retention_days
}

module "compute" {
  source = "./modules/compute"

  project_name             = var.project_name
  environment              = var.environment
  aws_region               = var.aws_region
  vpc_id                   = module.networking.vpc_id
  public_subnet_ids        = module.networking.public_subnet_ids
  private_subnet_ids       = module.networking.private_subnet_ids
  alb_security_group       = module.networking.alb_security_group_id
  compute_security_group   = module.networking.compute_security_group_id
  task_cpu                 = var.ecs_task_cpu
  task_memory              = var.ecs_task_memory
  desired_count            = var.ecs_desired_count
  min_count                = var.ecs_min_count
  max_count                = var.ecs_max_count
  server_image             = var.server_image
  client_image             = var.client_image
  acm_certificate_arn      = var.acm_certificate_arn
  route53_zone_id          = var.route53_zone_id
  domain_name              = var.domain_name
  api_subdomain            = var.api_subdomain
  app_subdomain            = var.app_subdomain
  log_retention_days       = var.log_retention_days
  database_secret_arn      = module.database.secret_arn
  kyc_bucket_name          = module.storage.kyc_bucket_name
  media_bucket_name        = module.storage.media_bucket_name
}

module "monitoring" {
  source = "./modules/monitoring"

  project_name       = var.project_name
  environment        = var.environment
  aws_region         = var.aws_region
  log_retention_days = var.log_retention_days
  ecs_cluster_name   = module.compute.cluster_name
  ecs_service_name   = module.compute.service_name
  alb_arn_suffix     = module.compute.alb_arn_suffix
  db_identifier      = module.database.identifier
}