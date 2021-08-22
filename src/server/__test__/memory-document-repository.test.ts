import { MemoryAuthorRepository, MemoryDocumentRepository } from "../interfaces";
import { Document, AuthorRepository, CreateDocumentInput, DocumentRepository, NotFoundError, validateDocument, ValidationError, UpdateDocumentInput } from "@/domain";


describe.only('Testing MemoryDocumentRepository', () => {
  let documents: DocumentRepository;
  let authors: AuthorRepository;


  beforeEach(() => {
    authors = new MemoryAuthorRepository();
    documents = new MemoryDocumentRepository(authors);
  });


  async function populate() : Promise<Document[]> {
    const auths = await Promise.all(
      ['Luke', 'Leia', 'Han', 'Chewie']
        .map(async name => await authors.create({ name }))
    );

    return Promise.all(auths.flatMap(author => 
      ['Title 1', 'Title 2', 'Title 3'].map(title =>
        documents.create({
          authorId: author.id,
          isPublic: author.name === 'Chewie',
          title: title
        })
      )
    ));
  }


  it.each([
    null,
    undefined,
    'a string',
    123,
    {},
    { authorId: '' },
    { authorId: 123 },
    { authorId: 'good', title: '' },
    { authorId: 'good', title: 'good', contentType: 'bad' },
  ])('should throw ValidationError if create() is given an invalid input', input => {
    expect(documents.create(input as CreateDocumentInput)).rejects.toBeInstanceOf(ValidationError);
  });


  it('should throw NotFoundError if the author does not exist', () => {
    const input: CreateDocumentInput = { authorId: 'validButNonexistent' };
    
    expect(documents.create(input)).rejects.toBeInstanceOf(NotFoundError);
  });


  it('should return a valid Document if create() is given a valid input', async () => {
    const author = await authors.create({ name: 'Chewbacca' });
    const input: CreateDocumentInput = { authorId: author.id };

    const document = await documents.create(input);

    expect(() => validateDocument(document)).not.toThrow();
  });


  it('should throw NotFoundError if getById() is given a non-existent id', async () => {
    await populate();

    expect(documents.getById('foo')).rejects.toBeInstanceOf(NotFoundError);
  });


  it('should return a valid Document if getById() is given a valid id', async () => {
    const docs = await populate();
    const document = docs[0];

    expect(documents.getById(document.id)).resolves.toMatchObject(document);
  });


  it('should return all documents by the given author', async () => {
    const docs = await populate();
    const { author } = docs[0];
    const expected = docs.filter(doc => doc.author.id === author.id);

    expect(documents.listByAuthor(author.id)).resolves.toMatchObject(expected);
  });


  it('should return only public documents', async () => {
    const docs = await populate();
    const expected = docs.filter(doc => doc.isPublic);

    expect(documents.listPublic()).resolves.toMatchObject(expected);
  });


  it('should modify the document when update() is given a valid input', async () => {
    const docs = await populate();
    const document = docs[0];
    const input: UpdateDocumentInput = { contentType: 'text/plain', content: 'A long time ago...' };
    const expected = { ...document, ...input };

    expect(documents.update(document.id, input)).resolves.toMatchObject(expected);
  });


  it('should delete the document', async () => {
    const docs = await populate();
    const document = docs[0];

    expect(documents.delete(document.id)).resolves.toBe(true);
    expect(documents.getById(document.id)).rejects.toBeInstanceOf(NotFoundError);
  });
})