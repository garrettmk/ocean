import { AuthorRepository, ID, NotFoundError, ValidationError } from '@/domain';
import { CreateUserInput, UserRepository, validateUser } from '../../../server/usecases';

const INVALID_IDS = [null, undefined, 0, '', 123, {}, []];


export type UserRepositoryTestConfig= {
  implementationName: string,
  beforeEach: () => Promise<{
    repository: UserRepository,
    authorRepository: AuthorRepository
  }>,
  afterEach: () => Promise<void>,
}


export function testUserRepository({
  implementationName,
  beforeEach: _beforeEach,
  afterEach: _afterEach,
}: UserRepositoryTestConfig) {
  describe(`Testing UserRepository implementation: ${implementationName}`, () => {
    let repository: UserRepository;
    let authorRepository: AuthorRepository;


    beforeEach(async () => {
      const result = await _beforeEach();
      repository = result.repository;
      authorRepository = result.authorRepository;
    });

    afterEach(async () => {
      await _afterEach();
    });


    describe('testing create()', () => {
      const VALID_INPUT = {
        name: 'username',
        author: {
          id: '1',
          name: 'authorname'
        }
      };
  
  
      it.each(INVALID_IDS)('should throw ValidationError if given id: %p', async value => {
        expect.assertions(1);
        await expect(repository.create(value as ID, VALID_INPUT)).rejects.toBeInstanceOf(ValidationError);
      });
  
  
      it.each([
        null,
        undefined,
        'a string',
        {},
        { name: 'valid', author: {} },
        { name: '', author: { id: 'authorId', name: 'author' } },
        { name: 'valid', author: { id: '', name: 'author' } },
        { name: 'valid', author: { id: 'authorId', name: '' } }
      ])('should throw ValidationError if given an invalid input', async input => {
        expect.assertions(1);
        await expect(repository.create('id', input as CreateUserInput)).rejects.toBeInstanceOf(ValidationError);
      });
    
    
      it('should return a valid user when given a valid input', async () => {
        expect.assertions(1);
        const author = await authorRepository.create({ name: 'username' });
        const user = await repository.create('valid', { name: 'username', author });
        expect(() => validateUser(user)).not.toThrow();
      });
    });
  
  
    describe('testing getById()', () => {
      it('should throw NotFoundError when given an invalid ID', async () => {
        expect.assertions(1);
        await expect(repository.getById('nonexistent')).rejects.toBeInstanceOf(NotFoundError);
      });
    
    
      it('should return a valid user if given a valid ID', async () => {
        expect.assertions(1);
        const author = await authorRepository.create({ name: 'Bob' });
        const user = await repository.create('userId', { name: 'Bob', author });
    
        const received = await repository.getById('userId');
        expect(received).toMatchObject(user);
      });
    });
  
  
    describe('testing getByAuthorId', () => {
      it('should return the user with the matching author id', async () => {
        expect.assertions(1);
        const author = await authorRepository.create({ name: 'username' });
        const user = await repository.create('userid', { name: 'username', author });
        const authorId = user.author.id;
  
        await expect(repository.getByAuthorId(authorId)).resolves.toMatchObject(user);
      });
    });
  
  
    describe('testing update()', () => {
      it('should modify the user if given an existing user ID', async () => {
        expect.assertions(2);
        const author = await authorRepository.create({ name: 'userId' });
        const original = await repository.create('userId', { name: 'Bob', author });
        const expected = { ...original, name: 'Larry' };
        
        const received = await repository.update(original.id, { name: expected.name });
    
        expect(received).toMatchObject(expected);
        await expect(repository.getById(original.id)).resolves.toMatchObject(expected);
      });
    });
  
  
    describe('Testing delete()', () => {
  
    });
  

  })
}