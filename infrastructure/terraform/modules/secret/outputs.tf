output "jwt_secret_arn" {
  value = aws_secretsmanager_secret.jwt_secret.arn
}

output "session_secret_arn" {
  value = aws_secretsmanager_secret.session_secret.arn
}

output "encryption_key_arn" {
  value = aws_secretsmanager_secret.encryption_key.arn
}

output "cookie_secret_arn" {
  value = aws_secretsmanager_secret.cookie_secret.arn
}

output "third_party_apis_arn" {
  value = aws_secretsmanager_secret.third_party_apis.arn
}