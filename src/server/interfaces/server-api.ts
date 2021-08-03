import { ServerUsersApi, ServerUsersApiContext } from "./server-users-api";
import { ServerDocumentsApi, ServerDocumentsApiContext } from "./server-documents-api";
import { ServerDocumentInteractor, ServerUserInteractor } from "../usecases";
import { GraphQLSchema } from "graphql";
import { mergeSchemas } from "@graphql-tools/merge";


export type ServerApiContext =
  ServerUsersApiContext &
  ServerDocumentsApiContext;


export class ServerApi {
  private users: ServerUsersApi;
  private documents: ServerDocumentsApi;

  
  constructor(usersInteractor: ServerUserInteractor, documentInteractor: ServerDocumentInteractor) {
    this.users = new ServerUsersApi(usersInteractor);
    this.documents = new ServerDocumentsApi(documentInteractor);
  }


  getSchema() : GraphQLSchema {
    return mergeSchemas({
      schemas: [
        this.users.getSchema(),
        this.documents.getSchema(),
      ]
    })
  }
}