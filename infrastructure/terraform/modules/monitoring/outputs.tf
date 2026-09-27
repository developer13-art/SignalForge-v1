output "log_group_name" {
  value = aws_cloudwatch_log_group.server.name
}

output "dashboard_name" {
  value = aws_cloudwatch_dashboard.main.dashboard_name
}