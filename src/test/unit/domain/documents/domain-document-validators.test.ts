import * as VALID from '@/test/__utils__/domain-valid-examples';
import * as INVALID from '@/test/__utils__/domain-invalid-examples';
import {
  ValidationError,
  validateDocumentId,
  validateDocumentHeader,
  validateDocument,
  validateCreateDocumentInput,
  validateUpdateDocumentInput,
  validateDocumentLink,
  validateDocumentLinkMeta
} from '@/domain';


const optional = (values: any[]) => values.filter(v => v !== undefined);


describe('Testing validateDocumentId', () => { 
  it.each(VALID.IDS)(`should not throw  an error if given valid id: %p`, value => {
    expect.assertions(1);
    expect(() => validateDocumentId(value)).not.toThrow();
  });

  it.each(INVALID.IDS)(`should throw ValidationError if given %p`, value => {
    expect.assertions(1);
    expect(() => validateDocumentId(value)).toThrow(ValidationError.name);
  });
});


describe('Testing validateDocumentHeader', () => {
  it.each(VALID.DOCUMENT_HEADERS)('should not throw an error if given a valid input', header => {
    expect.assertions(1);
    expect(() => validateDocumentHeader(header)).not.toThrow();
  });

  
  it.each(INVALID.OBJECTS)('should throw ValidationError if given %p', value => {
    expect.assertions(1);
    expect(() => validateDocumentHeader(value)).toThrow(ValidationError.name);
  });


  it.each(INVALID.IDS)('should throw ValidationError if given id: %p', id => {
    expect.assertions(1);
    expect(() => validateDocumentHeader(({ ...VALID.DOCUMENT_HEADERS[0], id }))).toThrow(ValidationError.name);
  });


  it.each(INVALID.AUTHORS)('should throw ValidationError if given author: %p', author => {
    expect.assertions(1);
    expect(() => validateDocumentHeader({ ...VALID.DOCUMENT_HEADERS[0], author })).toThrow(ValidationError.name);
  });


  it.each(INVALID.TITLES)('should throw ValidationError if given title: %p', title => {
    expect.assertions(1);
    expect(() => validateDocumentHeader(({ ...VALID.DOCUMENT_HEADERS[0], title }))).toThrow(ValidationError.name);
  });


  it.each(INVALID.CONTENT_TYPES)('should throw ValidationError if given contentType: %p', contentType => {
    expect.assertions(1);
    expect(() => validateDocumentHeader(({ ...VALID.DOCUMENT_HEADERS[0], contentType }))).toThrow(ValidationError.name);
  });
});


describe('Testing validateDocument', () => {
  it.each(VALID.DOCUMENTS)('should not throw an error if given a valid input', document => {
    expect.assertions(1);
    expect(() => validateDocument(document)).not.toThrow();
  });

  
  it.each(INVALID.OBJECTS)('should throw ValidationError if given %p', value => {
    expect.assertions(1);
    expect(() => validateDocument(value)).toThrow(ValidationError.name);
  });


  it.each(INVALID.IDS)('should throw ValidationError if given id: %p', id => {
    expect.assertions(1);
    expect(() => validateDocument(({ ...VALID.DOCUMENTS[0], id }))).toThrow(ValidationError.name);
  });


  it.each(INVALID.AUTHORS)('should throw ValidationError if given author: %p', author => {
    expect.assertions(1);
    expect(() => validateDocument({ ...VALID.DOCUMENTS[0], author })).toThrow(ValidationError.name);
  });


  it.each(INVALID.TITLES)('should throw ValidationError if given title: %p', title => {
    expect.assertions(1);
    expect(() => validateDocument({ ...VALID.DOCUMENTS[0], title })).toThrow(ValidationError.name);
  });


  it.each(INVALID.CONTENT_TYPES)('should throw ValidationError if given contentType: %p', contentType => {
    expect.assertions(1);
    expect(() => validateDocument({ ...VALID.DOCUMENTS[0], contentType })).toThrow(ValidationError.name);
  });
});


describe('Testing validateCreateDocumentInput', () => {
  it.each(VALID.CREATE_DOCUMENT_INPUTS)('should not throw an error if given a valid input', input => {
    expect.assertions(1);
    expect(() => validateCreateDocumentInput(input)).not.toThrow();
  });

  VALID.CREATE_DOCUMENT_INPUTS.forEach((input, i) => {
    it.each(optional(INVALID.TITLES))(`(${i}) should throw ValidationError if given title: %p`, title => {
      expect.assertions(1);
      expect(() => validateCreateDocumentInput({ ...input, title })).toThrow(ValidationError.name);
    });
  });

  VALID.CREATE_DOCUMENT_INPUTS.forEach((input, i) => {
    it.each(INVALID.CONTENT_TYPES)('should throw ValidationError if given contentType %p', contentType => {
      expect.assertions(1);
      expect(() => validateCreateDocumentInput({ ...input, contentType })).toThrow(ValidationError.name);
    });
  });
});


describe('Testing validateUpdateDocumentInput', () => {
  it.each(VALID.UPDATE_DOCUMENT_INPUTS)('should not throw an error if given a valid input', input => {
    expect.assertions(1);
    expect(() => validateUpdateDocumentInput(input)).not.toThrow();
  });


  VALID.UPDATE_DOCUMENT_INPUTS.forEach((input, i) => {
    it.each(optional(INVALID.TITLES))(`(${i}) should throw ValidationError if given title: %p`, value => {
      expect.assertions(1);
      const testValue = { ...input, title: value };

      expect(() => validateUpdateDocumentInput(testValue)).toThrow(ValidationError.name);
    });
  });


  VALID.UPDATE_DOCUMENT_INPUTS.forEach((input, i) => {
    it.each(INVALID.CONTENT_TYPES)('should throw ValidationError if given contentType: %p', contentType => {
      expect.assertions(1);
      expect(() => validateUpdateDocumentInput({ ...input, contentType })).toThrow(ValidationError.name);
    });
  });
})


describe('Testing validateDocumentLink', () => {
  it.each(VALID.DOCUMENT_LINKS)('should not throw an error if given a valid input', link => {
    expect.assertions(1);
    expect(() => validateDocumentLink(link)).not.toThrow();
  });


  it.each(INVALID.IDS)('should throw ValidationError if given from: %p', from => {
    expect.assertions(1);
    expect(() => validateDocumentLink({ ...VALID.DOCUMENT_LINKS[0], from })).toThrow(ValidationError.name);
  });


  it.each(INVALID.IDS)('should throw ValidationError if given to: %p', to => {
    expect.assertions(1);
    expect(() => validateDocumentLink({ ...VALID.DOCUMENT_LINKS[0], to })).toThrow(ValidationError.name);
  });


  it.each(INVALID.OBJECTS)('should throw ValidationError if given meta: %p', meta => {
    expect.assertions(1);
    expect(() => validateDocumentLink({ ...VALID.DOCUMENT_LINKS[0], meta })).toThrow(ValidationError.name);
  })
});


describe('Testing validateDocumentLinkMeta', () => {
  it.each(VALID.DOCUMENT_LINK_METAS)(`should not throw an error when given %p`, meta => {
    expect.assertions(1);
    expect(() => validateDocumentLinkMeta(meta)).not.toThrow();
  });


  it.each(INVALID.DOCUMENT_LINK_METAS)(`should throw ValidationError when given %p`, meta => {
    expect.assertions(1);
    expect(() => validateDocumentLinkMeta(meta)).toThrow(ValidationError.name);
  });
})