export const schema = `#graphql
type Restaurant{
    id: ID!
    name: String!
    address: String!
    country: String!
    location: String!
    phone: String!
    time: String!
    temp: Int!
}

type Query{
    getRestaurants(ciudad: String!): [Restaurant!]!
    getRestaurant(id: ID!): Restaurant
}

type Mutation{
    addRestaurant(nombre: String!, direccion: String!, ciudad: String!, telefono: String!): Restaurant!
    deleteRestaurant(id: ID!): Boolean!
}
`