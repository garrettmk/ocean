import { ID, UpdateDocumentInput } from '@/domain';
import type { CreateDocumentInput, ServerDocumentInteractor, User } from '@/server/usecases';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLSchema } from 'graphql';
import gql from 'graphql-tag';
import { AuthorizationError } from '../usecases/server-errors';


export type ServerDocumentsApiContext = () => {
  userId?: ID
}

export class ServerDocumentsApi {
  private interactor: ServerDocumentInteractor;

  
  constructor(interactor: ServerDocumentInteractor) {
    this.interactor = interactor;
  };


  getSchema() : GraphQLSchema {
    function getAuthenticatedUserId(context: ServerDocumentsApiContext) : ID {
      const { userId } = context();
      if (!userId)
        throw new AuthorizationError('Must be signed in');
      
      return userId;
    }

    return makeExecutableSchema<ServerDocumentsApiContext>({
      typeDefs: gql`
        type Author {
          id: ID!
          name: String!
        }

        type DocumentHeader {
          id: ID!
          author: Author!
          isPublic: Boolean!
          title: String!
          contentType: String!
        }

        type Document {
          id: ID!
          author: Author!
          isPublic: Boolean!
          title: String!
          contentType: String!
          content: String!
        }

        input CreateDocumentInput {
          title: String,
          contentType: String,
          content: String
        }

        input UpdateDocumentInput {
          title: String,
          contentType: String,
          content: String
        }

        type Mutation {
          createDocument(input: CreateDocumentInput!): Document
          updateDocument(documentId: ID!, input: UpdateDocumentInput!): Document!
        }

        type Query {
          listDocuments: [DocumentHeader!]!
        }
      `,

      resolvers: {
        Query: {
          listDocuments: (root, args, context, info) => {
            const { userId } = context();
            return this.interactor.listDocuments(userId);
          }
        },

        Mutation: {
          createDocument: (root, args, context, info) => {
            const userId = getAuthenticatedUserId(context);
            const { input }: { input: CreateDocumentInput } = args;

            return this.interactor.createDocument(userId, input);
          },

          updateDocument: (root, args, context, info) => {
            const userId = getAuthenticatedUserId(context);
            const { documentId, input }: { documentId: ID, input: UpdateDocumentInput } = args;

            return this.interactor.updateDocument(userId, documentId, input);
          }
        }
      }
    });
  }
}