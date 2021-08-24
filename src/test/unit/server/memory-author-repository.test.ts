import { MemoryAuthorRepository } from '@/server/interfaces';
import { ValidationError, NotFoundError, validateAuthor, AuthorRepository, CreateAuthorInput } from '@/domain';
import e from 'cors';


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
  ])('create(): should throw ValidationError if asked to create an author with input %p', async input => {
    expect.assertions(1);
    await expect(authors.create(input as CreateAuthorInput)).rejects.toBeInstanceOf((ValidationError));
  });


  it('create(): should return a valid Author instance if given a valid input', async () => {
    expect.assertions(1);

    const input = { name: 'Bob' };
    const received = await authors.create(input);

    await expect(() => validateAuthor(received)).not.toThrow();
  });


  it('getById(): should throw NotFoundError if given a non-existent ID', async () => {
    expect.assertions(1);

    await expect(authors.getById('nonexistent')).rejects.toBeInstanceOf(NotFoundError);
  });


  it('getById(): should return an author when given a valid ID', async () => {
    expect.assertions(1);

    const expected = await authors.create({ name: 'Bob' });
    const received = await authors.getById(expected.id);

    expect(received).toMatchObject(expected);
  });


})