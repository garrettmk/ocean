import gql from 'graphql-tag';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { IResolvers } from '@graphql-tools/utils'
import type { CreateDocumentInput, DocumentInteractor, User } from '@/server/usecases';
import { GraphQLSchema } from 'graphql';


export class DocumentsGraphQLApi {
  private interactor: DocumentInteractor;

  
  constructor(interactor: DocumentInteractor) {
    this.interactor = interactor;
    this.createDocument = this.createDocument.bind(this);
    this.listDocuments = this.listDocuments.bind(this);
  };


  getSchema() : GraphQLSchema {
    const typeDefs = gql`
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

      type Mutation {
        createDocument(input: CreateDocumentInput!): Document
      }

      type Query {
        listDocuments : [DocumentHeader!]!
      }
    `;

    const resolvers: IResolvers = {
      Query: {
        listDocuments: this.listDocuments,
      },

      Mutation: {
        createDocument: this.createDocument
      }
    }
    
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    return schema;
  }


  createDocument(parent: any, args: CreateDocumentInput, context: User | undefined, info: any) {
    if (!context)
      throw new Error('Must be signed in');
      
    return this.interactor.createDocument(context.id, args);
  }


  listDocuments(parent: never, args: never, context: User | undefined, info: any) {
    console.log({ info });

    return this.interactor.listDocuments(context?.id);
  }
}