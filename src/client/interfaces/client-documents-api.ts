import { CreateDocumentInput, ClientDocumentsGateway } from "@/server";
import { DocumentNode } from "graphql";
import gql from "graphql-tag";


interface GraphQLClient {
  query(q: DocumentNode, variables?: Record<string, any>): Promise<GraphQLResult>,
  mutation(m: DocumentNode, variables?: Record<string, any>): Promise<GraphQLResult>
}

type GraphQLResult = {
  data?: any,
  error?: any
}


export class DocumentsGraphQLClient implements ClientDocumentsGateway {
  private client: GraphQLClient;


  constructor(client: GraphQLClient) {
    this.client = client;
  }


  async listDocuments() {
    const query = gql`
      query {
        listDocuments {
          id
          title
          author {
            id
            name
          }
          isPublic
          contentType
        }
      }
    `;

    const result = await this.client.query(query);
    if (result.error)
      // Transform into an application error and throw
    
    return result.data?.listDocuments ?? [];
  }
}