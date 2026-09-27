# =============================================================
# SignalForge — Terraform Input Variables
# =============================================================

variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (staging, production)."
  type        = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

variable "project_name" {
  description = "Project name used as a prefix for all resources."
  type        = string
  default     = "signalforge"
}

variable "domain_name" {
  description = "Root domain name for the platform."
  type        = string
  default     = "signalforge.ai"
}

variable "api_subdomain" {
  description = "Subdomain for the API."
  type        = string
  default     = "api"
}

variable "app_subdomain" {
  description = "Subdomain for the web application."
  type        = string
  default     = "app"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.20.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones for multi-AZ deployment."
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets."
  type        = list(string)
  default     = ["10.20.1.0/24", "10.20.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets."
  type        = list(string)
  default     = ["10.20.11.0/24", "10.20.12.0/24"]
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.medium"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS in GB."
  type        = number
  default     = 100
}

variable "db_max_allocated_storage" {
  description = "Maximum autoscaling storage for RDS in GB."
  type        = number
  default     = 500
}

variable "db_name" {
  description = "Name of the PostgreSQL database."
  type        = string
  default     = "signalforge"
}

variable "db_username" {
  description = "Master username for PostgreSQL."
  type        = string
  default     = "signalforge_admin"
  sensitive   = true
}

variable "db_password" {
  description = "Master password for PostgreSQL."
  type        = string
  sensitive   = true
}

variable "db_multi_az" {
  description = "Enable Multi-AZ for the RDS instance."
  type        = bool
  default     = true
}

variable "db_backup_retention_days" {
  description = "Number of days to retain database backups."
  type        = number
  default     = 30
}

variable "ecs_task_cpu" {
  description = "CPU units for the ECS task (1024 = 1 vCPU)."
  type        = number
  default     = 1024
}

variable "ecs_task_memory" {
  description = "Memory for the ECS task in MiB."
  type        = number
  default     = 2048
}

variable "ecs_desired_count" {
  description = "Desired number of ECS task replicas."
  type        = number
  default     = 2
}

variable "ecs_min_count" {
  description = "Minimum number of ECS task replicas."
  type        = number
  default     = 2
}

variable "ecs_max_count" {
  description = "Maximum number of ECS task replicas."
  type        = number
  default     = 10
}

variable "server_image" {
  description = "Docker image URI for the server."
  type        = string
}

variable "client_image" {
  description = "Docker image URI for the client."
  type        = string
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS."
  type        = string
  default     = ""
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID."
  type        = string
  default     = ""
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days."
  type        = number
  default     = 30
}