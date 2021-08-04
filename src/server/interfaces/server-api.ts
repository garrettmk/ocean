import { ServerUsersApi, ServerUsersApiContext } from "./server-users-api";
import { ServerDocumentsApi, ServerDocumentsApiContext } from "./server-documents-api";
import { ServerDocumentInteractor, ServerUserInteractor } from "../usecases";
import { GraphQLSchema } from "graphql";
import { mergeSchemas } from "@graphql-tools/merge";
import { ServerDebugApi, ServerDebugApiContext } from "./server-debug-api";


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