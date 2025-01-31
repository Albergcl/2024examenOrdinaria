import { MongoClient } from "mongodb";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers } from "./resolvers.ts";
import { schema } from "./schema.ts";
import { RestaurantModel } from "./types.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");

if (!MONGO_URL) {
  throw new Error("No se ha encontrado la varaible de entorno MONGO_URL");
}

const mongoClient = new MongoClient(MONGO_URL);
await mongoClient.connect();

console.info("Conectado a MongoDB");

const mongoDB = mongoClient.db("restaurants");

const RestaurantCollection = mongoDB.collection<RestaurantModel>("restaurant");

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

const { url } = await startStandaloneServer(server, { context: async () => ({ RestaurantCollection })});

console.info(`Server ready at ${url}`);