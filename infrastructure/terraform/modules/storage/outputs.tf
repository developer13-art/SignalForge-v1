output "kyc_bucket_name" {
  value = aws_s3_bucket.kyc.id
}

output "kyc_bucket_arn" {
  value = aws_s3_bucket.kyc.arn
}

output "media_bucket_name" {
  value = aws_s3_bucket.media.id
}

output "media_bucket_arn" {
  value = aws_s3_bucket.media.arn
}

output "logs_bucket_name" {
  value = aws_s3_bucket.logs.id
}