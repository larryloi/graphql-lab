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

  input SlayerFilter {
    name: String
    prefix: String
    contains: String
    ageEq: Int
    ageGt: Int
    ageLt: Int
    orderBy: String
    orderDir: String
    limit: Int
    offset: Int
  }

  type Demon {
    id: ID!
    name: String
    level: Int
    age: Int
  }

  type OrderByIssuedAt {
    id: ID!
    order_id: String
    supplier_id: Int
    item_id: Int
    status: String
    qty: Int
    net_price: Int
    tax_rate: Float
    issued_at: String
    completed_at: String
    spec: String
    created_at: String
    updated_at: String
  }

  type OrderByIssuedAtMins {
    id: ID!
    order_id: String
    supplier_id: Int
    item_id: Int
    status: String
    qty: Int
    net_price: Int
    tax_rate: Float
    issued_at: String
    completed_at: String
    spec: String
    created_at: String
    updated_at: String
  }

  type OrderByUpdatedDate {
    id: ID!
    order_id: String
    supplier_id: Int
    item_id: Int
    status: String
    qty: Int
    net_price: Int
    tax_rate: Float
    issued_at: String
    completed_at: String
    spec: String
    created_at: String
    updated_at: String
  }

  type Query {
    users: [User]
    user(id: ID!): User
    slayers(filter: SlayerFilter): [Slayer]
    slayer(id: ID!): Slayer
    demons: [Demon]
    demon(id: ID!): Demon
    # issued_at should be an ISO-8601 or MySQL DATETIME string (e.g. "2023-01-01 00:00:00")
    ordersByIssuedAt(issued_at: String!, status: String!): [OrderByIssuedAt]
    ordersByIssuedAtMins(issuedAtMins: Int!, status: String!): [OrderByIssuedAtMins]
    ordersByUpdatedDate(updatedDate: String!, status: String!): [OrderByUpdatedDate]

    # New range and lookup queries for inventory.orders
    ordersByUpdatedRange(start: String!, end: String!, status: String!): [OrderByIssuedAt]
    ordersByIssuedRange(start: String!, end: String!, status: String!): [OrderByIssuedAt]
    ordersByCompletedRange(start: String!, end: String!, status: String!): [OrderByIssuedAt]
    ordersByCompletedRangeBySpecType(start: String!, end: String!, specType: String!): [OrderByIssuedAt]
    orderByOrderId(order_id: String!): OrderByIssuedAt
    ordersByCompletedSpecAndMinValue(start: String!, end: String!, specType: String!, minValue: Float!): [OrderByIssuedAt]
  }
  
`);

module.exports = schema;

