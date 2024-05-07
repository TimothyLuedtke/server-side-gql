const schema = `#graphql
type User {
    id: ID!
    email: String!
    createdAt: String!
    token: String
}
input AuthInput {
    email: String!
    password: String!
}

type Query {
me: User
}

type Mutation {
    createUser(input: AuthInput!): User
    signin(input: AuthInput!): User
}
`

export default schema
