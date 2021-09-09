import { Author, ValidationError } from "@/domain";
import { User, validateUser, validateCreateUserInput, validateUpdateUserInput, validateUserId } from "@/server/usecases";

const INVALID_OBJECTS = [null, undefined, NaN, 0, '', 123, 'hello', []];
const INVALID_IDS = [null, undefined, 0, '', 123, {}, []];
const INVALID_NAMES = [null, undefined, 0, '', 123, {}, []];


describe('Testing validateUserId', () => {
  it('should not throw an error when given a valid id', () => {
    expect.assertions(1);
    expect(() => validateUserId('valid')).not.toThrow();
  });

  it.each(INVALID_IDS)('should throw ValidationError if given: %p', value => {
    expect.assertions(1);
    expect(() => validateUserId(value)).toThrow(ValidationError.name);
  });
});

describe('Testing validateUser()', () => {
  const VALID_AUTHOR: Author = {
    id: 'valid',
    name: 'valid',
  };
  
  const VALID_USER: User = {
    id: 'valid',
    name: 'Chewie',
    author: VALID_AUTHOR
  };

  it('should not throw an error if given a valid input', () => {
    expect.assertions(1);
    expect(() => validateUser(VALID_USER)).not.toThrow();
  });


  it.each(INVALID_OBJECTS)('should throw ValidationError if given %p', input => {
    expect.assertions(1);
    expect(() => validateUser(input)).toThrow(ValidationError.name);
  });


  it.each(INVALID_IDS)('should throw ValidationError if given id: %p', value => {
    expect.assertions(1);
    expect(() => validateUser({ ...VALID_USER, id: value })).toThrow(ValidationError.name);
  });


  it.each(INVALID_NAMES)('should throw ValidationError if given name: %p', value => {
    expect.assertions(1);
    expect(() => validateUser({ ...VALID_USER, name: value })).toThrow(ValidationError.name);
  });


  it.each(INVALID_OBJECTS)('should throw ValidationError if given author: %p', value => {
    expect.assertions(1);
    expect(() => validateUser({ ...VALID_USER, author: value })).toThrow(ValidationError.name);
  });


  it.each(INVALID_IDS)('should throw ValidationError if given author.id: %p', value => {
    expect.assertions(1);
    expect(() => validateUser({ ...VALID_USER, author: { ...VALID_AUTHOR, id: value } })).toThrow(ValidationError.name);
  });


  it.each(INVALID_NAMES)('should throw ValidationError if given author.name: %p', value => {
    expect.assertions(1);
    expect(() => validateUser({ ...VALID_USER, author: { ...VALID_AUTHOR, name: value } })).toThrow(ValidationError.name);
  });
});


describe('Testing validateCreateUserInput()', () => {
  const VALID_INPUT = {
    name: 'valid',
    author: {
      id: 'valid-author-id',
      name: 'author name'
    }
  };


  it('should not throw an error if given a valid input', () => {
    expect.assertions(1);
    expect(() => validateCreateUserInput(VALID_INPUT)).not.toThrow();
  });


  it.each(INVALID_OBJECTS)('should throw ValidationError if given %p', input => {
    expect.assertions(1);
    expect(() => validateCreateUserInput(input)).toThrow(ValidationError.name);
  });

  it.each(INVALID_NAMES)('should throw ValidationError if given name: %p', value => {
    expect.assertions(1);
    expect(() => validateCreateUserInput({ ...VALID_INPUT, name: value })).toThrow(ValidationError.name);
  });


  it.each(INVALID_OBJECTS)('should throw ValidationError if given author: %p', value => {
    expect.assertions(1);
    expect(() => validateCreateUserInput({ ...VALID_INPUT, author: value })).toThrow(ValidationError.name);
  });


  it.each(INVALID_IDS)(`should throw ValidationError if given author.id: %p`, value => {
    expect.assertions(1);
    expect(() => validateCreateUserInput({
      ...VALID_INPUT,
      author: {
        ...VALID_INPUT.author,
        id: value
      }
    })).toThrow(ValidationError.name);
  });


  it.each(INVALID_NAMES)('should throw ValidationError if given author.name: %p', value => {
    expect.assertions(1);
    expect(() => validateCreateUserInput({
      ...VALID_INPUT,
      author: {
        ...VALID_INPUT.author,
        name: value
      }
    })).toThrow(ValidationError.name);
  });
});


describe('Testing validateUpdateUserInput()', () => {
  const VALID_INPUT = {
    name: 'valid'
  };


  it('should not throw an error if given a valid input', () => {
    expect.assertions(1);
    expect(() => validateUpdateUserInput(VALID_INPUT)).not.toThrow();
  });


  it.each(INVALID_OBJECTS)('should throw ValidationError if given %p', input => {
    expect.assertions(1);
    expect(() => validateUpdateUserInput(input)).toThrow(ValidationError.name);
  });

  it.each(INVALID_NAMES)('should throw ValidationError if given name: %p', value => {
    expect.assertions(1);
    expect(() => validateUpdateUserInput({ ...VALID_INPUT, name: value })).toThrow(ValidationError.name);
  });
});


