# =============================================================
# SignalForge — Production Environment
# =============================================================

aws_region   = "us-east-1"
environment  = "production"
project_name = "signalforge"

domain_name = "signalforge.ai"

# Multi-AZ for production
db_multi_az               = true
db_instance_class         = "db.t4g.medium"
db_allocated_storage      = 100
db_max_allocated_storage  = 500
db_backup_retention_days  = 30

# Larger ECS footprint
ecs_task_cpu       = 1024
ecs_task_memory    = 2048
ecs_desired_count  = 2
ecs_min_count      = 2
ecs_max_count      = 10

# Container images — replace with your ECR URIs after first push
server_image = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/signalforge-production-server:latest"
client_image = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/signalforge-production-client:latest"

log_retention_days = 30

# Fill in your existing hosted zone + cert ARNs
acm_certificate_arn = ""
route53_zone_id     = ""

# Database credentials (store in a secure location)
db_name     = "signalforge"
db_username = "signalforge_admin"
db_password = "CHANGE_ME_PRODUCTION_PASSWORD"