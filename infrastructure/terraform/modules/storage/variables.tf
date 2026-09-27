variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "allowed_origins" {
  description = "Allowed CORS origins for the media bucket."
  type        = list(string)
  default     = ["https://signalforge.ai"]
}