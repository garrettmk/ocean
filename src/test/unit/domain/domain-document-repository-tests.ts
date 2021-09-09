import {
  Author,
  AuthorRepository,
  Document,
  DocumentRepository,
  CreateDocumentInput,
  UpdateDocumentInput,
  ValidationError,
  NotFoundError,
  validateDocument
} from "@/domain";


const INVALID_OBJECTS = [null, undefined, NaN, 123, '', 'a string'];
const INVALID_TITLES = [null, NaN, {}, [], 123, ''];
const INVALID_CONTENT_TYPES = [null, NaN, {}, [], 123, '', 'text'];
const AUTHOR_NAMES = ['Luke', 'Leia', 'Han', 'Chewie'];
const INVALID_AUTHOR_ID = 'vader';


export type DocumentRepositoryTestConfig<T extends any> = {
  implementationName: string,
  beforeAll?: () => Promise<T>,
  beforeEach: (t?: T) => Promise<{
    repository: DocumentRepository,
    authorRepository: AuthorRepository
  }>
}


export function testDocumentRepository<T extends any>({
  implementationName,
  beforeAll: _beforeAll,
  beforeEach: _beforeEach
}: DocumentRepositoryTestConfig<T>) {
  describe(`Testing DocumentRepository implementation: ${implementationName}`, () => {
    let beforeAllResult: T;
    let repository: DocumentRepository;
    let authorRepository: AuthorRepository;
    let authors: Author[];
    let documents: Document[];


    beforeAll(async () => {
      if (_beforeAll)
        beforeAllResult = await _beforeAll();
    });


    beforeEach(async () => {
      const result = await _beforeEach(beforeAllResult);
      authorRepository = result.authorRepository;
      authors = await Promise.all(AUTHOR_NAMES.map(name => authorRepository.create({ name })));
      repository = result.repository;
    });


    async function populate() {
      documents = await Promise.all(authors.flatMap(author => 
        ['Title 1', 'Title 2', 'Title 3'].map(title =>
          repository.create(author.id, {
            isPublic: author.name === 'Chewie',
            title: title
          })
        )
      ));
    }


    describe('Testing create()', () => {
      const VALID_INPUT_1: CreateDocumentInput = {};
      
      const VALID_INPUT_2: CreateDocumentInput = {
        title: 'Document Title'
      };
  
      const VALID_INPUT_3: CreateDocumentInput = {
        isPublic: true
      };
  
      const VALID_INPUT_4: CreateDocumentInput = {
        contentType: 'text/plain',
        content: 'Document Content'
      };
  
      const VALID_INPUT_5: CreateDocumentInput = {
        title: 'Document Title',
        isPublic: true,
        contentType: 'text/plain',
        content: 'Document Content'
      };
  
  
      it.each(INVALID_OBJECTS)('should throw ValidationError if given input: %p', async value => {
        expect.assertions(1);
        const authorId = authors[0].id;
  
        await expect(repository.create(authorId, value as CreateDocumentInput)).rejects.toBeInstanceOf(ValidationError);
      });
  
  
      it.each(INVALID_TITLES)('should throw ValidationError if given title: %p', async value => {
        expect.assertions(5);
        const authorId = authors[0].id;
  
        await expect(repository.create(authorId, { ...VALID_INPUT_1, title: value as string })).rejects.toBeInstanceOf(ValidationError);
        await expect(repository.create(authorId, { ...VALID_INPUT_2, title: value as string })).rejects.toBeInstanceOf(ValidationError);
        await expect(repository.create(authorId, { ...VALID_INPUT_3, title: value as string })).rejects.toBeInstanceOf(ValidationError);
        await expect(repository.create(authorId, { ...VALID_INPUT_4, title: value as string })).rejects.toBeInstanceOf(ValidationError);
        await expect(repository.create(authorId, { ...VALID_INPUT_5, title: value as string })).rejects.toBeInstanceOf(ValidationError);
      });
  
  
      it.each(INVALID_CONTENT_TYPES)('should throw ValidationError if given contentType: %p', async value => {
        expect.assertions(5);
        const authorId = authors[0].id;
  
        await expect(repository.create(authorId, { ...VALID_INPUT_1, contentType: value as string })).rejects.toBeInstanceOf(ValidationError);
        await expect(repository.create(authorId, { ...VALID_INPUT_2, contentType: value as string })).rejects.toBeInstanceOf(ValidationError);
        await expect(repository.create(authorId, { ...VALID_INPUT_3, contentType: value as string })).rejects.toBeInstanceOf(ValidationError);
        await expect(repository.create(authorId, { ...VALID_INPUT_4, contentType: value as string })).rejects.toBeInstanceOf(ValidationError);
        await expect(repository.create(authorId, { ...VALID_INPUT_5, contentType: value as string })).rejects.toBeInstanceOf(ValidationError);
      });
  
  
      it('should throw NotFoundError if given an invalid author id', async () => {
        expect.assertions(1);
  
        await expect(repository.create(INVALID_AUTHOR_ID, VALID_INPUT_1)).rejects.toBeInstanceOf(NotFoundError);
      });
    
    
      it('should return a valid Document if given a valid input', async () => {
        expect.assertions(10);
        const authorId = authors[0].id;
  
        const result1 = await repository.create(authorId, VALID_INPUT_1);
        expect(result1).toMatchObject(VALID_INPUT_1);
        expect(() => validateDocument(result1)).not.toThrow();
        
        const result2 = await repository.create(authorId, VALID_INPUT_2);
        expect(result2).toMatchObject(VALID_INPUT_2);
        expect(() => validateDocument(result2)).not.toThrow();
    
        const result3 = await repository.create(authorId, VALID_INPUT_3);
        expect(result3).toMatchObject(VALID_INPUT_3);
        expect(() => validateDocument(result3)).not.toThrow();
  
        const result4 = await repository.create(authorId, VALID_INPUT_4);
        expect(result4).toMatchObject(VALID_INPUT_4);
        expect(() => validateDocument(result4)).not.toThrow();
  
        const result5 = await repository.create(authorId, VALID_INPUT_5);
        expect(result5).toMatchObject(VALID_INPUT_5);
        expect(() => validateDocument(result5)).not.toThrow();
      });
    });


    describe('Testing getById()', () => {
      beforeEach(async () => {
        await populate();
      });
  
  
      it('should throw NotFoundError if getById() is given a non-existent id', async () => {
        expect.assertions(1);
    
        await expect(repository.getById('foo')).rejects.toBeInstanceOf(NotFoundError);
      });
    
    
      it('should return a valid Document if getById() is given a valid id', async () => {
        expect.assertions(1);
        const document = documents[0];
    
        await expect(repository.getById(document.id)).resolves.toMatchObject(document);
      });
    });
  
  
    describe('Testing listByAuthor()', () => {
      beforeEach(async () => {
        await populate();
      });
  
      it('should return all documents by the given author', async () => {
        expect.assertions(1);
        const { author } = documents[0];
        const expected = documents
          .filter(doc => doc.author.id === author.id)
          .map(({ content, ...header }) => header);
    
        await expect(repository.listByAuthor(author.id)).resolves.toMatchObject(expected);
      });
    })
  
  
    describe('Testing listPublic()', () => {
      beforeEach(async () => {
        await populate();
      });
  
      it('should return only public documents', async () => {
        expect.assertions(1);
        const expected = documents
          .filter(doc => doc.isPublic)
          .map(({ content, ...header }) => header);

        await expect(repository.listPublic()).resolves.toMatchObject(expected);
      });
    });
  
  
    describe('Testing update()', () => {
      beforeEach(async () => {
        await populate()
      });
      
      it('should modify the document when update() is given a valid input', async () => {
        expect.assertions(1);
        const document = documents[0];
        const input: UpdateDocumentInput = { contentType: 'text/plain', content: 'A long time ago...' };
        const expected = { ...document, ...input };
    
        await expect(repository.update(document.id, input)).resolves.toMatchObject(expected);
      });
    });
  
  
    describe('Testing delete()', () => {
      beforeEach(async () => {
        await populate();
      });


      it('should delete the document', async () => {
        expect.assertions(2);
        const document = documents[0];
    
        await expect(repository.delete(document.id)).resolves.toStrictEqual(document);
        await expect(repository.getById(document.id)).rejects.toBeInstanceOf(NotFoundError);
      });
    });
  });
}