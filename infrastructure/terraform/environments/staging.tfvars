# =============================================================
# SignalForge — Staging Environment
# =============================================================

aws_region   = "us-east-1"
environment  = "staging"
project_name = "signalforge"

domain_name = "staging.signalforge.ai"

# Single-AZ for staging to reduce cost
db_multi_az               = false
db_instance_class         = "db.t4g.small"
db_allocated_storage      = 50
db_max_allocated_storage  = 200
db_backup_retention_days  = 7

# Smaller ECS footprint
ecs_task_cpu       = 512
ecs_task_memory    = 1024
ecs_desired_count  = 1
ecs_min_count      = 1
ecs_max_count      = 3

# Container images — replace with your ECR URIs after first push
server_image = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/signalforge-staging-server:latest"
client_image = "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/signalforge-staging-client:latest"

log_retention_days = 7

# Fill in your existing hosted zone + cert ARNs
acm_certificate_arn = ""
route53_zone_id     = ""

# Database credentials
db_name     = "signalforge"
db_username = "signalforge_admin"
db_password = "CHANGE_ME_STAGING_PASSWORD"