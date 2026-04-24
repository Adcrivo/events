# ─────────────────────────────────────────────────────────────
# Remote State Backend (S3)
# ─────────────────────────────────────────────────────────────
# Using partial configuration — actual values are passed via
# -backend-config at `terraform init` time per environment.
#
# Dev:  terraform init -backend-config=environments/dev.backend.hcl
# Prod: terraform init -backend-config=environments/prod.backend.hcl
# ─────────────────────────────────────────────────────────────

terraform {
  backend "s3" {
    # Configured via -backend-config files per environment
  }
}
