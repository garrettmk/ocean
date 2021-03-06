import { mergeSchemas } from "@graphql-tools/merge";
import { GraphQLSchema } from "graphql";
import { ServerDocumentInteractor, ServerUserInteractor } from "../usecases";
import { ServerDebugApi, ServerDebugApiContext } from "./server-debug-api";
import { ServerDocumentsApi, ServerDocumentsApiContext } from "./server-documents-api";
import { ServerUsersApi, ServerUsersApiContext } from "./server-users-api";


export type ServerApiContext =
  ServerDebugApiContext &
  ServerUsersApiContext &
  ServerDocumentsApiContext;

export class ServerApi {
  private debug: ServerDebugApi;
  private users: ServerUsersApi;
  private documents: ServerDocumentsApi;

  
  constructor(usersInteractor: ServerUserInteractor, documentInteractor: ServerDocumentInteractor) {
    this.debug = new ServerDebugApi();
    this.users = new ServerUsersApi(usersInteractor);
    this.documents = new ServerDocumentsApi(documentInteractor);
  }


  getSchema() : GraphQLSchema {
    return mergeSchemas({
      schemas: [
        this.debug.getSchema(),
        this.users.getSchema(),
        this.documents.getSchema(),
      ]
    })
  }
}