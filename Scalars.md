# Scalars support 

Apart from the traditional types implemented in GraphQL, we also support other scalar types to construct your schema. This support is based on the use of the [graphql-scalar](https://github.com/Urigo/graphql-scalars) library. It's already included when you generate your project.

## Types supported

At the time of usage, some new types may be added in the library but not be supported yet by Game Changer. Right now, it supports the following types : 

``` graphql
scalar Date

scalar Time

scalar DateTime

scalar Duration

scalar UtcOffset

scalar EmailAddress

scalar NegativeFloat

scalar NegativeInt

scalar NonEmptyString

scalar NonNegativeFloat

scalar NonNegativeInt

scalar NonPositiveFloat

scalar NonPositiveInt

scalar PhoneNumber

scalar PositiveFloat

scalar PositiveInt

scalar PostalCode

scalar UnsignedFloat

scalar UnsignedInt

scalar URL

scalar ObjectID

scalar BigInt

scalar Long

scalar SafeInt

scalar UUID

scalar GUID

scalar HexColorCode

scalar HSL

scalar HSLA

scalar IPv4

scalar IPv6

scalar ISBN

scalar MAC

scalar Port

scalar RGB

scalar RGBA

scalar USCurrency

scalar Currency

scalar JSON

scalar JSONObject

scalar Byte
```

For these types, just like traditional ones like String or Int, you won't have to manually set the files generated.

## Personalized scalars 

If the current types do not fit your needs, you can also define your own scalars. There will be templates for you to fill in the final code, like defining the corresponding resolvers.