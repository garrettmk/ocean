import { ValidationError, validateAuthor, validateCreateAuthorInput, validateDocumentHeader, validateDocument, validateCreateDocumentInput,
validateUpdateDocumentInput } from '@/domain';
import { NotImplementedError } from '@/domain';
import e from 'cors';


const INVALID_OBJECTS = [null, undefined, NaN, 0, '', 123, 'hello', []];
const INVALID_IDS = [null, undefined, 0, '', 123, {}, []];
const INVALID_NAMES = [null, undefined, 0, '', 123, {}, []];
const INVALID_TITLES = INVALID_NAMES;
const INVALID_CONTENT_TYPE = [...INVALID_NAMES, 'text'];

function optional(values: any[]) {
  return values.filter(v => v !== undefined);
}

const VALID_AUTHOR = {
  id: 'valid',
  name: 'valid',
};


describe('Testing validateAuthor', () => {
  it.each(INVALID_OBJECTS)('should throw ValidationError if given %p', value => {
    expect.assertions(1);
    expect(() => validateAuthor(value)).toThrow(ValidationError.name);
  });


  it('should not throw an error if given a valid Author object', () => {
    expect.assertions(1);
    expect(() => validateAuthor(VALID_AUTHOR)).not.toThrow();
  });


  it.each(INVALID_IDS)('should throw ValidationError if given id: %p', value => {
    expect.assertions(1);
    const testAuthor = { ...VALID_AUTHOR, id: value };

    expect(() => validateAuthor(testAuthor)).toThrow(ValidationError.name);
  });


  it.each(INVALID_NAMES)('should throw ValidationError if given name: %p', value => {
    expect.assertions(1);
    const testAuthor = { ...VALID_AUTHOR, name: value };

    expect(() => validateAuthor(testAuthor)).toThrow(ValidationError.name);
  });
});



describe('Testing validateCreateAuthorInput', () => {
  const VALID_INPUT = { name: 'valid' };

  it('should not throw an error if given a valid input', () => {
    expect.assertions(1);
    expect(() => validateCreateAuthorInput(VALID_INPUT)).not.toThrow();
  });


  it.each(INVALID_OBJECTS)('should throw ValidationError if given %p', (value) => {
    expect.assertions(1);
    expect(() => validateCreateAuthorInput(value)).toThrow(ValidationError.name);
  });


  it.each(INVALID_NAMES)('should throw ValidationError if given name: %p', (value) => {
    expect.assertions(1);
    const testInput = { ...VALID_INPUT, name: value };

    expect(() => validateCreateAuthorInput(testInput)).toThrow(ValidationError.name);
  });
});


describe('Testing validateDocumentHeader', () => {
  const VALID_HEADER = {
    id: 'valid',
    author: VALID_AUTHOR,
    isPublic: true,
    title: 'untitled',
    contentType: 'text/html'
  };

  it('should not throw an error if given a valid input', () => {
    expect.assertions(1);
    expect(() => validateDocumentHeader(VALID_HEADER)).not.toThrow();
  });

  
  it.each(INVALID_OBJECTS)('should throw ValidationError if given %p', value => {
    expect.assertions(1);
    expect(() => validateDocumentHeader(value)).toThrow(ValidationError.name);
  });


  it.each(INVALID_IDS)('should throw ValidationError if given id: %p', value => {
    expect.assertions(1);
    const testHeader = { ...VALID_HEADER, id: value };

    expect(() => validateDocumentHeader(testHeader)).toThrow(ValidationError.name);
  });


  it.each(INVALID_OBJECTS)('should throw ValidationError if given author: %p', value => {
    expect.assertions(1);
    const testValue = { ...VALID_HEADER, author: value };

    expect(() => validateDocumentHeader(testValue)).toThrow(ValidationError.name);
  });


  it.each(INVALID_IDS)('should throw ValidationError if given author.id: %p', value => {
    expect.assertions(1);
    const testValue = { ...VALID_HEADER, author: { ...VALID_AUTHOR, id: value } };

    expect(() => validateDocumentHeader(testValue)).toThrow(ValidationError.name);
  });


  it.each(INVALID_NAMES)('should throw ValidationError if given author.name: %p', value => {
    expect.assertions(1);
    const testValue = { ...VALID_HEADER, author: { ...VALID_AUTHOR, name: value } };

    expect(() => validateDocumentHeader(testValue)).toThrow(ValidationError.name);
  });


  it.each(INVALID_TITLES)('should throw ValidationError if given title: %p', value => {
    expect.assertions(1);
    const testValue = { ...VALID_HEADER, title: value };

    expect(() => validateDocumentHeader(testValue)).toThrow(ValidationError.name);
  });


  it.each(INVALID_CONTENT_TYPE)('should throw ValidationError if given contentType: %p', value => {
    expect.assertions(1);
    const testValue = { ...VALID_HEADER, contentType: value };

    expect(() => validateDocumentHeader(testValue)).toThrow(ValidationError.name);
  });
});


describe('Testing validateDocument', () => {
  const VALID_DOC = {
    id: 'valid',
    author: VALID_AUTHOR,
    isPublic: true,
    title: 'untitled',
    contentType: 'text/html'
  };

  it('should not throw an error if given a valid input', () => {
    expect.assertions(1);
    expect(() => validateDocument(VALID_DOC)).not.toThrow();
  });

  
  it.each(INVALID_OBJECTS)('should throw ValidationError if given %p', value => {
    expect.assertions(1);
    expect(() => validateDocument(value)).toThrow(ValidationError.name);
  });


  it.each(INVALID_IDS)('should throw ValidationError if given id: %p', value => {
    expect.assertions(1);
    const testHeader = { ...VALID_DOC, id: value };

    expect(() => validateDocument(testHeader)).toThrow(ValidationError.name);
  });


  it.each(INVALID_OBJECTS)('should throw ValidationError if given author: %p', value => {
    expect.assertions(1);
    const testValue = { ...VALID_DOC, author: value };

    expect(() => validateDocument(testValue)).toThrow(ValidationError.name);
  });


  it.each(INVALID_IDS)('should throw ValidationError if given author.id: %p', value => {
    expect.assertions(1);
    const testValue = { ...VALID_DOC, author: { ...VALID_AUTHOR, id: value } };

    expect(() => validateDocument(testValue)).toThrow(ValidationError.name);
  });


  it.each(INVALID_NAMES)('should throw ValidationError if given author.name: %p', value => {
    expect.assertions(1);
    const testValue = { ...VALID_DOC, author: { ...VALID_AUTHOR, name: value } };

    expect(() => validateDocument(testValue)).toThrow(ValidationError.name);
  });


  it.each(INVALID_TITLES)('should throw ValidationError if given title: %p', value => {
    expect.assertions(1);
    const testValue = { ...VALID_DOC, title: value };

    expect(() => validateDocument(testValue)).toThrow(ValidationError.name);
  });


  it.each(INVALID_CONTENT_TYPE)('should throw ValidationError if given contentType: %p', value => {
    expect.assertions(1);
    const testValue = { ...VALID_DOC, contentType: value };

    expect(() => validateDocument(testValue)).toThrow(ValidationError.name);
  });
});


describe('Testing validateCreateDocumentInput', () => {
  const VALID_INPUT_1 = {
    isPublic: true,
    title: 'untitled',
  };

  const VALID_INPUT_2 = {
    ...VALID_INPUT_1,
    contentType: 'text/html',
    content: 'any'
  };


  it.each([VALID_INPUT_1, VALID_INPUT_2])('should not throw an error if given a valid input', value => {
    expect.assertions(1);
    expect(() => validateCreateDocumentInput(value)).not.toThrow();
  });

  [VALID_INPUT_1, VALID_INPUT_2].forEach((input, i) => {
    it.each(INVALID_IDS)(`(${i}) should throw ValidationError if given authorId: %p`, value => {
      expect.assertions(1);
      const testValue = { ...input, authorId: value };

      expect(() => validateCreateDocumentInput(testValue)).toThrow(ValidationError.name);
    });
  });


  [VALID_INPUT_1, VALID_INPUT_2].forEach((input, i) => {
    it.each(optional(INVALID_TITLES))(`(${i}) should throw ValidationError if given title: %p`, value => {
      expect.assertions(1);
      const testValue = { ...input, title: value };

      expect(() => validateCreateDocumentInput(testValue)).toThrow(ValidationError.name);
    });
  });


  it.each(INVALID_CONTENT_TYPE)('should throw ValidationError if given contentType: %p', value => {
    expect.assertions(1);
    const testValue = { ...VALID_INPUT_2, contentType: value };

    expect(() => validateCreateDocumentInput(testValue)).toThrow(ValidationError.name);
  });
});


describe('Testing validateUpdateDocumentInput', () => {
  const VALID_INPUT_1 = {
    isPublic: true,
    title: 'untitled',
  };

  const VALID_INPUT_2 = {
    ...VALID_INPUT_1,
    contentType: 'text/html',
    content: 'any'
  };


  it.each([VALID_INPUT_1, VALID_INPUT_2])('should not throw an error if given a valid input', value => {
    expect.assertions(1);
    expect(() => validateUpdateDocumentInput(value)).not.toThrow();
  });


  [VALID_INPUT_1, VALID_INPUT_2].forEach((input, i) => {
    it.each(optional(INVALID_TITLES))(`(${i}) should throw ValidationError if given title: %p`, value => {
      expect.assertions(1);
      const testValue = { ...input, title: value };

      expect(() => validateUpdateDocumentInput(testValue)).toThrow(ValidationError.name);
    });
  });


  it.each(INVALID_CONTENT_TYPE)('should throw ValidationError if given contentType: %p', value => {
    expect.assertions(1);
    const testValue = { ...VALID_INPUT_2, contentType: value };

    expect(() => validateUpdateDocumentInput(testValue)).toThrow(ValidationError.name);
  });
})