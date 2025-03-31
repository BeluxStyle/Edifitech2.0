import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "/api/graphql", // URL de tu servidor GraphQL
  cache: new InMemoryCache(),
});

export default client;
