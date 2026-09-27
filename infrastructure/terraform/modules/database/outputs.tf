output "endpoint" {
  value = aws_db_instance.main.address
}

output "port" {
  value = aws_db_instance.main.port
}

output "database_name" {
  value = aws_db_instance.main.db_name
}

output "identifier" {
  value = aws_db_instance.main.identifier
}

output "secret_arn" {
  value = aws_secretsmanager_secret.db_credentials.arn
}