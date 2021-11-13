import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLSchema } from "graphql";
import { JSONResolver } from 'graphql-scalars';
import gql from "graphql-tag";


export type ServerDebugApiContext = () => any;


export class ServerDebugApi {
  getSchema() : GraphQLSchema {
    return makeExecutableSchema({
      typeDefs: gql`
        scalar JSON

        type Query {
          resolverContext: JSON
        }
      `,

      resolvers: {
        JSON: JSONResolver,

        Query: {
          resolverContext: (parent, args, context, info) => {
            const value = context();
            return value;
          }
        }
      }
    });
  }
}