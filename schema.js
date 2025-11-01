const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Slayer {
    id: ID!
    name: String
    breathing_style: String
    age: Int
  }

  type Demon {
    id: ID!
    name: String
    level: Int
    age: Int
  }

  type Query {
    users: [User]
    user(id: ID!): User
    slayers: [Slayer]
    slayer(id: ID!): Slayer
    demons: [Demon]
    demon(id: ID!): Demon
  }
  
`);

module.exports = schema;

