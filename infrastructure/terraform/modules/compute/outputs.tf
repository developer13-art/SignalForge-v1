output "cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "cluster_arn" {
  value = aws_ecs_cluster.main.arn
}

output "service_name" {
  value = aws_ecs_service.server.name
}

output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "alb_zone_id" {
  value = aws_lb.main.zone_id
}

output "alb_arn_suffix" {
  value = aws_lb.main.arn_suffix
}

output "server_ecr_repository" {
  value = aws_ecr_repository.server.repository_url
}

output "client_ecr_repository" {
  value = aws_ecr_repository.client.repository_url
}

output "server_target_group_arn" {
  value = aws_lb_target_group.server.arn
}

output "client_target_group_arn" {
  value = aws_lb_target_group.client.arn
}