import { CreateDocumentInput } from "src/server/usecases";

interface GraphQLClient {
  query(q: any): Promise<any>,
  mutation(m: any): Promise<any>
}


export class DocumentsGraphQLClient {
  private client: GraphQLClient;

  constructor(client: GraphQLClient) {
    this.client = client;
  }


  async createDocument(input: CreateDocumentInput) {
    const mutation = '';
    const result = await this.client.mutation(mutation);
    // Error/result checking
  }
}