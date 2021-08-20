import { AuthorRepository, NotFoundError, ValidationError } from '@/domain';
import { MemoryAuthorRepository, MemoryUserRepository } from '@/server/interfaces';
import { SaveUserInput, UserRepository, validateUser } from '../usecases';


describe('Testing MemoryUserRepository', () => {
  let authors: AuthorRepository;
  let users: UserRepository;

  beforeEach(() => {
    authors = new MemoryAuthorRepository();
    users = new MemoryUserRepository(authors);
  });


  it.each([
    null,
    undefined,
    'a string',
    {},
    { id: 'valid', name: 'valid', author: {} },
    { id: 'valid', name: '', author: { id: 'authorId', name: 'author' } },
    { id: '', name: 'valid', author: { id: 'authorId', name: 'author' } }
  ])('should throw ValidationError if given an invalid input', input => {
    expect(users.save(input as SaveUserInput)).rejects.toBeInstanceOf(ValidationError);
  });


  it('should return a valid user when given a valid input', async () => {
    const user = await users.save({ id: 'valid', name: 'username' });
    expect(() => validateUser(user)).not.toThrow();
  });


  it('should throw NotFoundError when given an invalid ID', async () => {
    expect(users.getById('nonexistent')).rejects.toBeInstanceOf(NotFoundError);
  });


  it('should return a valid user if given a valid ID', async () => {
    const user = await users.save({ id: 'userId', name: 'Bob' });

    const received = await users.getById('userId');
    expect(received).toMatchObject(user);
  });


  it('should modify the user if given an existing user ID', async () => {
    const original = await users.save({ id: 'userId', name: 'Bob' });
    const expected = { ...original, name: 'Larry' };
    
    const received = await users.save({ id: original.id, name: expected.name });

    expect(received).toMatchObject(expected);
    expect(users.getById(original.id)).resolves.toMatchObject(expected);
  });
})