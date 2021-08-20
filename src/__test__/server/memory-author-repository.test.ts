import { MemoryAuthorRepository } from '@/server/interfaces';
import { ValidationError, NotFoundError, validateAuthor, AuthorRepository, CreateAuthorInput } from '@/domain';


describe('Testing MemoryAuthorRepository', () => {
  let authors: AuthorRepository;


  beforeEach(() => {
    authors = new MemoryAuthorRepository();
  });


  it.each([
    null,
    [],
    {},
    { name: '' },
    { name: 123 }
  ])('create(): should throw ValidationError if asked to create an author with input %p', input => {
    expect(authors.create(input as CreateAuthorInput)).rejects.toBeInstanceOf((ValidationError));
  });


  it('create(): should return a valid Author instance if given a valid input', async () => {
    const input = { name: 'Bob' };

    const received = await authors.create(input);

    expect(() => validateAuthor(received)).not.toThrow();
  });


  it('getById(): should throw NotFoundError if given a non-existent ID', () => {
    expect(authors.getById('nonexistent')).rejects.toBeInstanceOf(NotFoundError);
  });


  it('getById(): should return an author when given a valid ID', async () => {
    const expected = await authors.create({ name: 'Bob' });

    const received = await authors.getById(expected.id);

    expect(received).toMatchObject(expected);
  });


})