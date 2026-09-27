# =============================================================
# Secrets Module — Secrets Manager for sensitive values
# =============================================================

# -------------------------------------------------------------
# JWT / Session / Encryption Secrets
# -------------------------------------------------------------

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${var.project_name}/${var.environment}/jwt-secret"
  description             = "SignalForge JWT signing secret"
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = {
    Name        = "${var.project_name}-${var.environment}-jwt-secret"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt_secret.result
}

resource "random_password" "jwt_secret" {
  length  = 96
  special = true
}

resource "aws_secretsmanager_secret" "session_secret" {
  name                    = "${var.project_name}/${var.environment}/session-secret"
  description             = "SignalForge session secret"
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = {
    Name        = "${var.project_name}-${var.environment}-session-secret"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "session_secret" {
  secret_id     = aws_secretsmanager_secret.session_secret.id
  secret_string = random_password.session_secret.result
}

resource "random_password" "session_secret" {
  length  = 96
  special = true
}

resource "aws_secretsmanager_secret" "encryption_key" {
  name                    = "${var.project_name}/${var.environment}/encryption-key"
  description             = "SignalForge AES encryption key for sensitive fields"
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = {
    Name        = "${var.project_name}-${var.environment}-encryption-key"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "encryption_key" {
  secret_id     = aws_secretsmanager_secret.encryption_key.id
  secret_string = random_password.encryption_key.result
}

resource "random_password" "encryption_key" {
  length  = 64
  special = false
}

resource "aws_secretsmanager_secret" "cookie_secret" {
  name                    = "${var.project_name}/${var.environment}/cookie-secret"
  description             = "SignalForge cookie signing secret"
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = {
    Name        = "${var.project_name}-${var.environment}-cookie-secret"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "cookie_secret" {
  secret_id     = aws_secretsmanager_secret.cookie_secret.id
  secret_string = random_password.cookie_secret.result
}

resource "random_password" "cookie_secret" {
  length  = 96
  special = true
}

# -------------------------------------------------------------
# Third-party API Credentials (populated manually after apply)
# -------------------------------------------------------------

resource "aws_secretsmanager_secret" "third_party_apis" {
  name                    = "${var.project_name}/${var.environment}/third-party-apis"
  description             = "SignalForge third-party API credentials"
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = {
    Name        = "${var.project_name}-${var.environment}-third-party-apis"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "third_party_apis" {
  secret_id = aws_secretsmanager_secret.third_party_apis.id

  secret_string = jsonencode({
    METAAPI_TOKEN              = ""
    TELEGRAM_API_ID            = ""
    TELEGRAM_API_HASH          = ""
    TELEGRAM_SESSION_ENCRYPTION_KEY = ""
    DISCORD_CLIENT_ID          = ""
    DISCORD_CLIENT_SECRET      = ""
    DISCORD_BOT_TOKEN          = ""
    OPENAI_API_KEY             = ""
    ANTHROPIC_API_KEY          = ""
    GOOGLE_AI_API_KEY          = ""
    STRIPE_SECRET_KEY          = ""
    STRIPE_PUBLISHABLE_KEY     = ""
    STRIPE_WEBHOOK_SECRET      = ""
    PAYSTACK_SECRET_KEY        = ""
    PAYSTACK_PUBLIC_KEY        = ""
    PAYSTACK_WEBHOOK_SECRET    = ""
    FLUTTERWAVE_SECRET_KEY     = ""
    FLUTTERWAVE_PUBLIC_KEY     = ""
    FLUTTERWAVE_WEBHOOK_SECRET = ""
    SMILEID_PARTNER_ID         = ""
    SMILEID_API_KEY            = ""
    VERIFYME_CLIENT_ID         = ""
    VERIFYME_CLIENT_SECRET     = ""
    SOLANA_ADMIN_KEYPAIR       = ""
    SOLANA_TREASURY_WALLET     = ""
    SOLANA_PAYMENT_TOKEN_MINT  = ""
    SMTP_USERNAME              = ""
    SMTP_PASSWORD              = ""
    TWILIO_ACCOUNT_SID         = ""
    TWILIO_AUTH_TOKEN          = ""
    FCM_SERVER_KEY             = ""
  })
}