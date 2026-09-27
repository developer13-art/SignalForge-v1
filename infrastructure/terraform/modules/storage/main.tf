# =============================================================
# Storage Module — S3 buckets for KYC documents and public media
# =============================================================

data "aws_caller_identity" "current" {}

# -------------------------------------------------------------
# KYC Documents Bucket (private, encrypted, versioned)
# -------------------------------------------------------------

resource "aws_s3_bucket" "kyc" {
  bucket        = "${var.project_name}-${var.environment}-kyc-documents"
  force_destroy = var.environment != "production"

  tags = {
    Name        = "${var.project_name}-${var.environment}-kyc-documents"
    Environment = var.environment
    Purpose     = "kyc-documents"
    Sensitivity = "high"
  }
}

resource "aws_s3_bucket_versioning" "kyc" {
  bucket = aws_s3_bucket.kyc.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "kyc" {
  bucket = aws_s3_bucket.kyc.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "kyc" {
  bucket = aws_s3_bucket.kyc.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "kyc" {
  bucket = aws_s3_bucket.kyc.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "kyc" {
  bucket = aws_s3_bucket.kyc.id

  rule {
    id     = "expire-noncurrent-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }

  rule {
    id     = "abort-incomplete-multipart"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

resource "aws_s3_bucket_logging" "kyc" {
  bucket = aws_s3_bucket.kyc.id

  target_bucket = aws_s3_bucket.logs.id
  target_prefix = "s3-access-logs/kyc/"
}

resource "aws_s3_bucket_policy" "kyc" {
  bucket = aws_s3_bucket.kyc.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "DenyInsecureConnections"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource = [
          aws_s3_bucket.kyc.arn,
          "${aws_s3_bucket.kyc.arn}/*"
        ]
        Condition = {
          Bool = { "aws:SecureTransport" = "false" }
        }
      },
      {
        Sid       = "DenyUnencryptedObjectUploads"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:PutObject"
        Resource  = "${aws_s3_bucket.kyc.arn}/*"
        Condition = {
          StringNotEquals = {
            "s3:x-amz-server-side-encryption" = "AES256"
          }
        }
      }
    ]
  })
}

# -------------------------------------------------------------
# Public Media Bucket (for provider avatars, logos, marketing assets)
# -------------------------------------------------------------

resource "aws_s3_bucket" "media" {
  bucket        = "${var.project_name}-${var.environment}-media"
  force_destroy = var.environment != "production"

  tags = {
    Name        = "${var.project_name}-${var.environment}-media"
    Environment = var.environment
    Purpose     = "public-media"
    Sensitivity = "low"
  }
}

resource "aws_s3_bucket_versioning" "media" {
  bucket = aws_s3_bucket.media.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "media" {
  bucket = aws_s3_bucket.media.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "media" {
  bucket = aws_s3_bucket.media.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = false
}

resource "aws_s3_bucket_ownership_controls" "media" {
  bucket = aws_s3_bucket.media.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_cors_configuration" "media" {
  bucket = aws_s3_bucket.media.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD", "PUT", "POST"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "media" {
  bucket = aws_s3_bucket.media.id

  rule {
    id     = "expire-noncurrent-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

resource "aws_s3_bucket_logging" "media" {
  bucket = aws_s3_bucket.media.id

  target_bucket = aws_s3_bucket.logs.id
  target_prefix = "s3-access-logs/media/"
}

# -------------------------------------------------------------
# Access Logs Bucket
# -------------------------------------------------------------

resource "aws_s3_bucket" "logs" {
  bucket        = "${var.project_name}-${var.environment}-s3-access-logs"
  force_destroy = false

  tags = {
    Name        = "${var.project_name}-${var.environment}-s3-access-logs"
    Environment = var.environment
    Purpose     = "access-logs"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "logs" {
  bucket = aws_s3_bucket.logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    id     = "expire-old-logs"
    status = "Enabled"

    filter {}

    expiration {
      days = 365
    }
  }
}

# -------------------------------------------------------------
# Block all public access by default at account level
# -------------------------------------------------------------

resource "aws_s3_account_public_access_block" "main" {
  block_public_acls       = true
  block_public_policy     = false
  ignore_public_acls      = true
  restrict_public_buckets = false
}