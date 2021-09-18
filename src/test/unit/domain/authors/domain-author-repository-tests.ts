import { Author, AuthorRepository, CreateAuthorInput, NotFoundError, validateAuthor, ValidationError } from "@/domain";


const INVALID_OBJECTS = [null, undefined, NaN, 0, 123, '', 'a string'];
const INVALID_NAMES = [null, undefined, NaN, {}, [], 0, 123, ''];


export type AuthorRepositoryTestConfig = {
  implementationName: string,
  beforeEach: () => Promise<{
    repository: AuthorRepository
  }>,
  afterEach: () => Promise<void>,
}


export function testAuthorRepository({
  implementationName,
  beforeEach: _beforeEach,
  afterEach: _afterEach,
}: AuthorRepositoryTestConfig) {
  describe(`Testing AuthorRepository implementation: ${implementationName}`, () => {
    let repository: AuthorRepository;
    
    beforeEach(async () => {
      const result = await _beforeEach();
      repository = result.repository;
    });

    afterEach(async () => {
      return _afterEach();
    });

    
    describe('Testing create()', () => {
      const VALID_INPUT: CreateAuthorInput = {
        name: 'Luke Skywalker'
      };


      it('should return a valid Author if given a valid input', async () => {
        expect.assertions(2);
        
        const received = await repository.create(VALID_INPUT);

        expect(() => validateAuthor(received)).not.toThrow();
        expect(received).toMatchObject(VALID_INPUT);
      });


      it.each(INVALID_OBJECTS)('should throw ValidationError if given input: %p', async value => {
        expect.assertions(1);
        await expect(repository.create(value as unknown as CreateAuthorInput)).rejects.toBeInstanceOf(ValidationError);
      });


      it.each(INVALID_NAMES)('should throw ValidationError if given input: %p', async value => {
        expect.assertions(1);
        await expect(repository.create({ ...VALID_INPUT, name: value as string })).rejects.toBeInstanceOf(ValidationError);
      });
    });


    describe('Testing getById()', () => {
      let author: Author;


      beforeEach(async () => {
        author = await repository.create({ name: 'Luke Skywalker' });
      });


      it('should return an author when given an id', async () => {
        expect.assertions(1);
        await expect(repository.getById(author.id)).resolves.toEqual(author);
      });


      it('should throw NotFoundError if given a non-existent id', async () => {
        expect.assertions(1);
        await expect(repository.getById('vader')).rejects.toBeInstanceOf(NotFoundError);
      });
    });


    describe('Testing listById', () => {
      let authors: Author[];

      beforeEach(async () => {
        authors = await Promise.all(['Luke', 'Leia', 'Han'].map(name => {
          return repository.create({ name });
        }));
      });


      it('should return the requested authors', async () => {
        expect.assertions(2);
        const expected = authors.slice(0, 2);
        const ids = expected.map(({ id }) => id);

        const received = await repository.listById(ids);

        expect(received).toEqual(expect.arrayContaining(expected));
        expect(expected).toEqual(expect.arrayContaining(received));
      });


      it('should throw NotFoundError if any of the ids are invalid', async () => {
        expect.assertions(1);
        const ids = authors
          .slice(0, 2)
          .map(({ id }) => id)
          .concat(['vader']);

        await expect(repository.listById(ids)).rejects.toBeInstanceOf(NotFoundError);
      });
    });
  });
}