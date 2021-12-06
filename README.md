# generator-aws-server-gamechanger

Generator based on [Yeoman](https://yeoman.io/) of a serverless GraphQL API that can be deployed on AWS from a GraphQL schema

## Requirement

- yeoman

```
npm install -g yo
```

- [terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli)
- [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
- An AWS Account set up and configured on your machine ( best if you use the [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) to configure with `aws configure` command)
- A valid GraphQL schema

## Installation

### Using npm (Usage only)

```
npm install -g generator-aws-server-gamechanger
```

### Locally (For developement)

Get the project and install its dependencies

```
git clone https://github.com/GameChangerCloud/generator-aws-server-gamechanger
```

```
cd generator-aws-server-gamechanger
```

```
npm install
```

Link the project to your local node_modules folder

```
npm link
```

This generator is for developers who prefers to use TypeScript, React and node as their primary technologies. If you are interested in contributing or modifying the generator itself, install all modules before building the solution.  

```
npm install
npm run build
```
## Usage

Generate your server application

```
yo aws-server-gamechanger <your-app-name> <your-graphql-schema>.graphql
cd <your-app-name>
```

Generate your AWS infrastructure

```
cd terraform
terraform init
terraform apply -var-file="terraform.tfvar"
```

For destroying the infrastructure

```
terraform destroy -var-file="terraform.tfvar"
```

### API Gateway

You will find the endpoint of your server in the file '\<your-app-name>/terraform/url.txt'.

### Cognito

You will find cognito's information in the file '\<your-app-name>/terraform/cognito.txt'.

### Requirement for queries

Before executing queries, you need to get the token for cognito

```
aws cognito-idp admin-initiate-auth --user-pool-id <your-cognito-pool-id> --client-id <your-cognito-client-id> --auth-flow ADMIN_NO_SRP_AUTH --auth-parameters USERNAME=admin@admin.fr,PASSWORD=password
```

Get the IdToken field of the response.
Put the following header for all queries

```
{
    Authorization : <IdToken>
}
```

### Queries for the database

Launch Postman and put the URL of API Gateway.
Configure Postman to send "POST" query.
Send the request with these following bodies :

Create tables in the database

```
{
    "initTable" : "sometext"
}
```

Response if success in create tables

```
Init Done
```

Fill tables with fakes data

```
{
    "fillTable" : "sometext"
}
```

Response if success in fill tables

```
Fill Done
```

Delete data in the database

```
{
    "cleanTables" : "sometext"
}
```

Response if success in delete tables

```
Clean Done
```

Drop tables of the database (and data)

```
{
    "dropTables" : "sometext"
}
```

Response if success in delete tables

```
Drop Done
```

Update database (see next part for more information)

```
{
    "updateDatabase" : "sometext"
}
```

### Query for the lambda

Any request (replace YOUR_QUERY_GRAPHQL by your query)

```
{
    "query" : "YOUR_QUERY_GRAPHQL"
}
```

Example :

```
{
    "query" : "query employes {employes {id} }"
}
```

### Update the database schema

1. Updates supported

- Add a new entity

- Delete an entity

- Update an entity

  - Create a new field (which any type)
  - Delete a field
  - Update the type of a field

List of updates supported :

- String

String -> String!

Rule : (NULL -> ' ')

String -> Int!

Rule : (NULL or String which contains a character which is not a number -> 0)

String -> Int

Rule : (String which contains a character which is not a number -> 0)

String -> Boolean!

Rule : ('true' -> true / NULL or !'true' -> false)

String -> Boolean

Rule : ('true' -> true / !'true' -> false)

- Int

Int -> Int!

Rule : (NULL -> 0)

Int -> String!

Rule : (NULL -> ' ')

Int -> String

Rule : (number -> number.toString())

Int -> Boolean!

Rule : (0 or NULL -> false / !0 -> true)

Int -> Boolean

Rule : (0 -> false / !0 -> true)

- Boolean

Boolean -> Boolean!

Rule : (NULL -> false)

Boolean -> String!

Rule : (NULL -> ' ')

Boolean -> String

Rule : (boolean -> boolean.toString())

Boolean -> Int!

Rule : (false or NULL -> 0 / true -> 1)

Boolean -> Int

Rule : (false -> 0 / true -> 1)

2. Usage

In the folder which contains your app named "\<your-app-name>"

```
yo aws-server-gamechanger <your-app-name> <your-new-graphql-schema>.graphql
```

Then, send the request for update (see in the previous part)

## Notes

### How to use it

By default, the cognito account is :
login : admin@admin.fr
password : password
For executing queries you have to put the right header for request and a body among those described in "Usage" part.

### Check queries execution

If you want to check if the request has been send and execute by the database, you can :

1. Go on AWS platform

2. Go on RDS section -> Query editor

3. Put your information to the connection in the database (see terraform.tfvar file)

4. To check the existence of your tables, execute the request "SELECT \* FROM information_schema.tables;" and check if there tables of your entities.

5. To check the modification of data in your tables, execute the request "SELECT \* FROM oneOfYourEntities;" and check data in your tables.
