import { ID, UpdateDocumentInput } from '@/domain';
import type { CreateDocumentInput, ServerDocumentInteractor } from '@/server/usecases';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLSchema } from 'graphql';
import gql from 'graphql-tag';
import { AuthorizationError } from '../usecases/server-errors';
import { JSONResolver } from 'graphql-scalars';



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
        scalar JSON

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
          content: JSON
        }

        type DocumentLink {
          from: ID!
          to: ID!
          meta: JSON
        }

        type DocumentGraph {
          documents: [DocumentHeader!]!
          links: [DocumentLink!]!
        }

        input CreateDocumentInput {
          title: String,
          contentType: String,
          content: JSON
        }

        input UpdateDocumentInput {
          title: String,
          contentType: String,
          content: JSON
        }

        type Mutation {
          createDocument(input: CreateDocumentInput!): Document!
          updateDocument(id: ID!, input: UpdateDocumentInput!): Document!
          deleteDocument(id: ID!): Document!
          linkDocuments(fromId: ID!, toId: ID!, meta: JSON): DocumentLink!
          unlinkDocuments(fromId: ID!, toId: ID!): DocumentLink!
          importDocumentFromUrl(url: String!): Document!
        }

        type Query {
          listDocuments: [DocumentHeader!]!
          getDocument(id: ID!): Document!
          getRecommendedLinks(id: ID!) : DocumentGraph!
        }
      `,

      resolvers: {
        JSON: JSONResolver,

        Query: {
          listDocuments: (root, args, context, info) => {
            const { userId } = context();
            return this.interactor.listDocuments(userId);
          },

          getDocument: (root, args, context, info) => {
            const { userId } = context();
            const { id: documentId } = args;

            return this.interactor.getDocument(userId, documentId);
          },

          getRecommendedLinks: (root, args, context, info) => {
            const { userId } = context();
            const { id: documentId } = args;

            return this.interactor.getRecommendedLinks(userId!, documentId);
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
            const { id, input }: { id: ID, input: UpdateDocumentInput } = args;

            return this.interactor.updateDocument(userId, id, input);
          },

          deleteDocument: (root, args, context, info) => {
            const userId = getAuthenticatedUserId(context);
            const { id } = args;

            return this.interactor.deleteDocument(userId, id);
          },

          linkDocuments: (root, args, context, info) => {
            const userId = getAuthenticatedUserId(context);
            const { fromId, toId, meta } = args;

            return this.interactor.linkDocuments(userId, fromId, toId, meta);
          },

          unlinkDocuments: (root, args, context, info) => {
            const userId = getAuthenticatedUserId(context);
            const { fromId, toId } = args;

            return this.interactor.unlinkDocuments(userId, fromId, toId);
          },

          importDocumentFromUrl: (root, args, context, info) => {
            const userId = getAuthenticatedUserId(context);
            const { url } = args;

            return this.interactor.importDocumentFromUrl(userId, url);
          }
        }
      }
    });
  }
}