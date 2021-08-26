import { MemoryAuthorRepository, MemoryDocumentRepository } from "../../../server/interfaces";
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
        documents.create(author.id, {
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
    { title: '' },
    { title: 'good', contentType: 'bad' },
  ])('should throw ValidationError if create() is given an invalid input', async input => {
    expect.assertions(1);
    await expect(documents.create('luke', input as CreateDocumentInput)).rejects.toBeInstanceOf(ValidationError);
  });


  it('should throw NotFoundError if the author does not exist', async () => {
    expect.assertions(1);
    const input: CreateDocumentInput = {};
    
    await expect(documents.create('vader', input)).rejects.toBeInstanceOf(NotFoundError);
  });


  it('should return a valid Document if create() is given a valid input', async () => {
    expect.assertions(1);
    const author = await authors.create({ name: 'Chewbacca' });
    const input: CreateDocumentInput = {};

    const document = await documents.create(author.id, input);

    expect(() => validateDocument(document)).not.toThrow();
  });


  it('should throw NotFoundError if getById() is given a non-existent id', async () => {
    expect.assertions(1);
    await populate();

    await expect(documents.getById('foo')).rejects.toBeInstanceOf(NotFoundError);
  });


  it('should return a valid Document if getById() is given a valid id', async () => {
    expect.assertions(1);
    const docs = await populate();
    const document = docs[0];

    await expect(documents.getById(document.id)).resolves.toMatchObject(document);
  });


  it('should return all documents by the given author', async () => {
    expect.assertions(1);
    const docs = await populate();
    const { author } = docs[0];
    const expected = docs.filter(doc => doc.author.id === author.id);

    await expect(documents.listByAuthor(author.id)).resolves.toMatchObject(expected);
  });


  it('should return only public documents', async () => {
    expect.assertions(1);
    const docs = await populate();
    const expected = docs.filter(doc => doc.isPublic);

    await expect(documents.listPublic()).resolves.toMatchObject(expected);
  });


  it('should modify the document when update() is given a valid input', async () => {
    expect.assertions(1);
    const docs = await populate();
    const document = docs[0];
    const input: UpdateDocumentInput = { contentType: 'text/plain', content: 'A long time ago...' };
    const expected = { ...document, ...input };

    await expect(documents.update(document.id, input)).resolves.toMatchObject(expected);
  });


  it('should delete the document', async () => {
    expect.assertions(2);
    const docs = await populate();
    const document = docs[0];

    await expect(documents.delete(document.id)).resolves.toBe(true);
    await expect(documents.getById(document.id)).rejects.toBeInstanceOf(NotFoundError);
  });
})