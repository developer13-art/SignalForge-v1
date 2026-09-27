# =============================================================
# SignalForge — Terraform Provider Configuration
# =============================================================

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket         = "signalforge-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "signalforge-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "SignalForge"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "SignalForge Engineering"
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "SignalForge"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "SignalForge Engineering"
    }
  }
}