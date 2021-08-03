import type { CreateDocumentInput, DocumentInteractor, User } from '@/server/usecases';


export class DocumentsGraphQLApi {
  private interactor: DocumentInteractor;

  constructor(interactor: DocumentInteractor) {
    this.interactor = interactor;
  };


  getSchema() {
    // Use imported typedefs
    // Create a resolvers definition using this.<resolver>
    // Create and return a schema using makeExecutableSchema
  }


  createDocument(parent: any, args: CreateDocumentInput, context: User | undefined, info: any) {
    if (!context)
      throw new Error('Must be signed in');
      
    return this.interactor.createDocument(context.id, args);
  }
}