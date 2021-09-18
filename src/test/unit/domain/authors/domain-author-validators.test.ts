import * as VALID from '@/test/__utils__/domain-valid-examples';
import * as INVALID from '@/test/__utils__/domain-invalid-examples';
import { validateAuthor, validateCreateAuthorInput, ValidationError } from '@/domain';


describe('Testing validateAuthor', () => {
  it.each(INVALID.OBJECTS)('should throw ValidationError if given %p', value => {
    expect.assertions(1);
    expect(() => validateAuthor(value)).toThrow(ValidationError.name);
  });


  it.each(VALID.AUTHORS)('should not throw an error if given a valid Author object %p', author => {
    expect.assertions(1);
    expect(() => validateAuthor(author)).not.toThrow();
  });


  it.each(INVALID.IDS)('should throw ValidationError if given id: %p', value => {
    expect.assertions(1);
    const testAuthor = { ...VALID.AUTHORS[0], id: value };

    expect(() => validateAuthor(testAuthor)).toThrow(ValidationError.name);
  });


  it.each(INVALID.NAMES)('should throw ValidationError if given name: %p', value => {
    expect.assertions(1);
    const testAuthor = { ...VALID.AUTHORS[0], name: value };

    expect(() => validateAuthor(testAuthor)).toThrow(ValidationError.name);
  });
});



describe('Testing validateCreateAuthorInput', () => {
  it.each(VALID.CREATE_AUTHOR_INPUTS)('should not throw an error if given a valid input', input => {
    expect.assertions(1);
    expect(() => validateCreateAuthorInput(input)).not.toThrow();
  });


  it.each(INVALID.OBJECTS)('should throw ValidationError if given %p', (value) => {
    expect.assertions(1);
    expect(() => validateCreateAuthorInput(value)).toThrow(ValidationError.name);
  });


  it.each(INVALID.NAMES)('should throw ValidationError if given name: %p', (value) => {
    expect.assertions(1);
    const testInput = { ...VALID.CREATE_AUTHOR_INPUTS[0], name: value };

    expect(() => validateCreateAuthorInput(testInput)).toThrow(ValidationError.name);
  });
});
