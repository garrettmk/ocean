import { GraphQLSchema } from "graphql";
import gql from "graphql-tag";
import { ServerUserInteractor } from "../usecases/server-user-interactor";
import { IResolvers } from "@graphql-tools/utils";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ID } from "@/domain";
import { User } from "../usecases";
import { AuthorizationError } from "../usecases/server-errors";


export type ServerUsersApiContext = () => {
  userId?: ID
}


export class ServerUsersApi {
  private interactor: ServerUserInteractor;


  constructor(interactor: ServerUserInteractor) {
    this.interactor = interactor;
  }


  getSchema() : GraphQLSchema {
    function getAuthenticatedUserId(context: ServerUsersApiContext) : ID {
      const { userId } = context();
      if (!userId)
        throw new AuthorizationError('Must be signed in');
      
      return userId;
    }


    return makeExecutableSchema<ServerUsersApiContext>({
      typeDefs: gql`
        type User {
          id: ID!
          name: String!
        }

        type Mutation {
          loginUser(name: String!) : User
        }
      `,

      resolvers: {
        Mutation: {
          loginUser: (parent, args, context, info) => {
            const userId = getAuthenticatedUserId(context);
            return this.interactor.loginUser(userId, args.name);
          }
        }
      }
    });
  }
}