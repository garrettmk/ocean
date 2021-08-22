import { AuthorRepository, DocumentRepository, NotFoundError, Document, validateDocument, ValidationError, UpdateDocumentInput } from "@/domain";
import e from "cors";
import { MemoryAuthorRepository, MemoryDocumentRepository, MemoryUserRepository } from "../interfaces";
import { CreateDocumentInput, ServerDocumentInteractor, User, UserRepository } from "../usecases";
import { AuthorizationError } from "../usecases/server-errors";



describe('Testing ServerDocumentInteractor', () => {
  let interactor: ServerDocumentInteractor;
  let documents: DocumentRepository;
  let users: UserRepository;
  let authors: AuthorRepository;

  beforeEach(() => {
    authors = new MemoryAuthorRepository();
    users = new MemoryUserRepository(authors);
    documents = new MemoryDocumentRepository(authors);
    interactor = new ServerDocumentInteractor(documents, users);
  });


  async function populate() : Promise<Document[]> {
    const names = ['Luke', 'Leia', 'Han', 'Chewie'];

    const usrs = await Promise.all(
      names.map(async name => await users.save({
        id: name.toLowerCase(),
        name,
      }))
    );

    const docs = Promise.all(usrs.flatMap(user => 
      ['Title 1', 'Title 2', 'Title 3'].map(title =>
        documents.create({
          authorId: user.author.id,
          isPublic: user.author.name === 'Chewie',
          title: title
        })
      )
    ));

    return docs;
  }

  describe('Testing create()', () => {
    let user: User;
    let input: CreateDocumentInput;

    beforeEach(async () =>{
      user = await users.save({ id: 'user-id', name: 'username' });
      input = {};
    });

    it('should create and return a new document', async () => {
      const doc = await interactor.createDocument(user.id, input);
  
      expect(() => validateDocument(doc)).not.toThrow();
      expect(documents.getById(doc.id)).resolves.toMatchObject(doc);
      expect(doc.author.id).toBe(user.author.id);
    });
  
  
    it('should throw NotFoundError given an invalid userId', async () => {  
      expect(interactor.createDocument('vader', input)).rejects.toBeInstanceOf(NotFoundError);
    });
  
  
    it('should throw ValidationError if given an invalid input', async () => {
      const input = { title: 123 } as unknown as CreateDocumentInput;
  
      expect(interactor.createDocument(user.id, input)).rejects.toBeInstanceOf(ValidationError);
    });
  });


  describe('Testing listDocuments()', () => {
    it('should return all public documents', async () => {
      const docs = await populate();
      const publicDocs = docs.filter(doc => doc.isPublic);
  
      expect(interactor.listDocuments()).resolves.toMatchObject(publicDocs);
    });
  
  
    it('should return all documents with a matching author', async () => {
      const docs = await populate();
      const authorDocs = docs.filter(doc => doc.author.name === 'Luke');
  
      expect(interactor.listDocuments('luke')).resolves.toMatchObject(authorDocs);
    });
  
  
    it('should throw NotFoundError if given a non-existent user id', async () => {
      const docs = await populate();
  
      expect(interactor.listDocuments('vader')).rejects.toBeInstanceOf(NotFoundError);
    });
  });


  describe('Testing updateDocument()', () => {
    let docs: Document[];
    let document: Document;
    let input: UpdateDocumentInput = { title: 'The Empire Strikes Back' };
    let expected: Document;


    beforeEach(async () => {
      docs = await populate();
      document = docs[0];
      expected = { ...document, ...input };
    });


    it('should return the updated document', async () => {
      expect(interactor.updateDocument('luke', document.id, input )).resolves.toMatchObject(expected);
    });


    it('should save the updated document in the repository', async () => {
      await interactor.updateDocument('luke', document.id, input);
      expect(documents.getById(document.id)).resolves.toMatchObject(expected);
    });


    it('should throw NotFoundError if given a non-existent Author id', async () => {
      expect(interactor.updateDocument('vader', document.id, input)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw NotFoundError if given a non-existent document id', async () => {
      expect(interactor.updateDocument('luke', 'rawr', input)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw AuthorizationError if the user is not the document author', async () => {
      expect(interactor.updateDocument('leia', document.id, input)).rejects.toBeInstanceOf(AuthorizationError);
    });


    it('should throw ValidationError if the input is invalid', async () => {
      const invalidInput = { title: 123 } as unknown as UpdateDocumentInput;
      expect(interactor.updateDocument('luke', document.id, invalidInput)).rejects.toBeInstanceOf(ValidationError);
    });
  });


  describe('Testing getDocument()', () => {
    let docs: Document[];

    beforeEach(async () => {
      docs = await populate();
    });


    it('should return a valid document', async () => {
      const document = docs[0];
      expect(interactor.getDocument('luke', document.id)).resolves.toMatchObject(document);
    });

    
    it('should return a public document even if no user id is given', async () => {
      const document = docs.find(doc => doc.isPublic) as Document;
      expect(interactor.getDocument(undefined, document.id));
    });


    it('should throw NotFoundError if given a nonexistent user id', async () => {
      expect(interactor.getDocument('vader', docs[0].id)).rejects.toBeInstanceOf(NotFoundError);
    });


    it('should throw AuthorizationError if the document is not public and the user is not the author', async () => {
      const document = docs.find(doc => doc.isPublic === false) as Document;
      expect(interactor.getDocument('leia', document.id)).rejects.toBeInstanceOf(AuthorizationError);
    });
  });
});