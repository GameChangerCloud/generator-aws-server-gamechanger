resource "aws_rds_cluster" "postgresql" {
  cluster_identifier      = var.cluster_db
  engine                  = "aurora-postgresql"
  engine_mode             = "serverless"
  engine_version          = "10.7"
  availability_zones      = ["${var.region}a", "${var.region}b" , "${var.region}c"]
  database_name           = var.db_name
  master_username         = var.db_username
  master_password         = var.db_password
  backup_retention_period = 5
  preferred_backup_window = "07:00-09:00"
  skip_final_snapshot     = true
  enable_http_endpoint    = true
}
