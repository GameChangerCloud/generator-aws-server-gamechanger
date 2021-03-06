resource "aws_cognito_user_pool" "pool" {
  name = "pool-<%-appname%>"
  password_policy {
    minimum_length = 6
    require_lowercase = false
    require_uppercase = false
    require_numbers = false
    require_symbols = false
  }
  auto_verified_attributes = ["email"]
  schema {
    name                     = "email"
    attribute_data_type      =  "String"
    developer_only_attribute = false
    mutable                  = true  # false for "sub"
    required                 = true # true for "sub"
    string_attribute_constraints {   # if it is a string
      min_length = 0                 # 10 for "birthdate"
      max_length = 2048              # 10 for "birthdate"
    }
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name = "client-<%-appname%>"

  user_pool_id = aws_cognito_user_pool.pool.id
  callback_urls = ["http://localhost:3000/callback", "http://localhost:4200"]
  logout_urls = ["http://localhost:3000"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows = ["code", "implicit"]
  allowed_oauth_scopes = ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"]
  supported_identity_providers = ["COGNITO"]
  explicit_auth_flows = ["ALLOW_ADMIN_USER_PASSWORD_AUTH", "ALLOW_CUSTOM_AUTH", "ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "domain-<%-appname%>"
  user_pool_id = aws_cognito_user_pool.pool.id
}

resource "null_resource" "createUserUnconfirmed" {
  provisioner "local-exec" {
    command = "aws cognito-idp sign-up --region eu-west-1 --client-id ${aws_cognito_user_pool_client.client.id} --username admin@admin.fr --user-attributes Name=\"email\",Value=\"admin@admin.fr\" --password password"
  }
}

resource "null_resource" "confirmUserCreate" {
  depends_on = [null_resource.createUserUnconfirmed]
  provisioner "local-exec" {
    command = "aws cognito-idp admin-confirm-sign-up --region eu-west-1 --user-pool-id ${aws_cognito_user_pool.pool.id} --username admin@admin.fr"
  }
}

resource "null_resource" "getUserPool" {
  provisioner "local-exec" {
    command = "echo 'poolID: ${aws_cognito_user_pool.pool.id}\n\nclientID: ${aws_cognito_user_pool_client.client.id}' > ./cognito.txt"
  }
}

resource "aws_api_gateway_authorizer" "authorizer" {
  name                   = "my-authorizer"
  type                   = "COGNITO_USER_POOLS"
  rest_api_id            = aws_api_gateway_rest_api.myAPI.id
  provider_arns          = [aws_cognito_user_pool.pool.arn]
}