data "archive_file" "init" {
  type        = "zip"
  source_dir  =  "${path.module}/.."
  excludes    = ["terraform"]
  output_path = "${path.module}/lambda.zip"
}


resource "aws_lambda_function" "lambda" {
  source_code_hash = data.archive_file.init.output_base64sha256
  function_name = var.lambda_name
  description = "Lamdba for  <%-appName%>"
  role = aws_iam_role.instance.arn
  filename = data.archive_file.init.output_path
  handler = "index.handler"
  runtime = "nodejs12.x"
  timeout = 60
  environment {
    variables = {
      SECRETARN = aws_secretsmanager_secret.example.arn
      RESOURCEARN = aws_rds_cluster.postgresql.arn
      DATABASE = aws_rds_cluster.postgresql.database_name
    }
  }
  provisioner "local-exec" {
    command = <<EOT
                export arn=${aws_rds_cluster.postgresql.arn}
                export secretArn=${aws_secretsmanager_secret.example.arn}
                rm -f final.yaml ../temp.yaml  
                ( echo "cat <<EOF > ../template.yaml";
                  cat ../template.yaml;
                ) >../temp.yaml
                . ../temp.yaml
              EOT
    interpreter = ["bash", "-c"]
  }
  

}

resource "aws_lambda_permission" "lambda_permission" {
  depends_on = [aws_api_gateway_deployment.myDeployement]
  statement_id  = "AllowMyDemoAPIInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "apigateway.amazonaws.com"

  # The /*/*/* part allows invocation from any stage, method and resource path
  # within API Gateway REST API.
  source_arn = "${aws_api_gateway_rest_api.myAPI.execution_arn}/*/*/*"
}