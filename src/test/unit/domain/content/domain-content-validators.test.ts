import { validateContentAnalyzer, validateContentMigration, validateContentMigrationPath, validateParsedContentType, ValidationError } from "@/domain";
import * as INVALID from '../../../__utils__/domain-content-invalid-examples';
import * as VALID from '../../../__utils__/domain-content-valid-examples';


describe('Testing validateParsedContentType', () => {
  it.each(VALID.PARSED_CONTENT_TYPES)(`should not throw an error if given %p`, value => {
    expect.assertions(1);
    expect(() => validateParsedContentType(value)).not.toThrow();
  });

  it.each(INVALID.OBJECTS)(`should throw ValidationError if given %p`, value => {
    expect.assertions(1);
    expect(() => validateParsedContentType(value)).toThrow(ValidationError.name);
  });

  it.each(INVALID.NAMES)(`should throw ValidationError if given name %p`, value => {
    expect.assertions(2);
    expect(() => validateParsedContentType({ ...VALID.PARSED_CONTENT_TYPES[0], name: value })).toThrow(ValidationError.name);
    expect(() => validateParsedContentType({ ...VALID.PARSED_CONTENT_TYPES[1], name: value })).toThrow(ValidationError.name);
  });

  it.each(INVALID.VALUES)(`should throw ValidationError if given value %p`, value => {
    expect.assertions(2);
    expect(() => validateParsedContentType({ ...VALID.PARSED_CONTENT_TYPES[0], value })).toThrow(ValidationError.name);
    expect(() => validateParsedContentType({ ...VALID.PARSED_CONTENT_TYPES[1], value })).toThrow(ValidationError.name);
  });

  it.each(INVALID.TYPES)(`should throw ValidationError if given type %p`, type => {
    expect.assertions(2);
    expect(() => validateParsedContentType({ ...VALID.PARSED_CONTENT_TYPES[0], type })).toThrow(ValidationError.name);
    expect(() => validateParsedContentType({ ...VALID.PARSED_CONTENT_TYPES[1], type })).toThrow(ValidationError.name);
  });

  it.each(INVALID.SUBTYPES)(`should throw ValidationError if given subType %p`, subType => {
    expect.assertions(2);
    expect(() => validateParsedContentType({ ...VALID.PARSED_CONTENT_TYPES[0], subType })).toThrow(ValidationError.name);
    expect(() => validateParsedContentType({ ...VALID.PARSED_CONTENT_TYPES[1], subType })).toThrow(ValidationError.name);
  });

  it.each(INVALID.PARAMETERS)(`should throw ValidationError if given parameter %p`, parameter => {
    expect.assertions(1);    
    expect(() => validateParsedContentType({ ...VALID.PARSED_CONTENT_TYPES[1], parameter })).toThrow(ValidationError.name);
  });

  it.each(INVALID.PARAMETER_VALUES)(`should throw ValidationError if given parameterValue %p`, parameterValue => {
    expect.assertions(1);
    expect(() => validateParsedContentType({ ...VALID.PARSED_CONTENT_TYPES[1], parameterValue })).toThrow(ValidationError.name);
  });
});


describe('Testing validateContentMigration()', () => {
  it.each(VALID.CONTENT_MIGRATIONS)('should not throw an error if given %p', value => {
    expect.assertions(1);
    expect(() => validateContentMigration(value)).not.toThrow()
  });

  it.each(INVALID.OBJECTS)(`should throw ValidationError if given %p`, value => {
    expect.assertions(1);
    expect(() => validateContentMigration(value)).toThrow(ValidationError.name);
  });


  it.each(INVALID.CONTENT_TYPES)(`should throw ValidationError if given from %p`, from => {
    expect.assertions(1);
    expect(() => validateContentMigration({ ...VALID.CONTENT_MIGRATIONS[0], from })).toThrow(ValidationError.name);
  });

  it.each(INVALID.CONTENT_TYPES)(`should throw ValidationError if given to %p`, to => {
    expect.assertions(1);
    expect(() => validateContentMigration({ ...VALID.CONTENT_MIGRATIONS[0], to })).toThrow(ValidationError.name);
  });

  it.each(INVALID.MIGRATES)(`should throw ValidationError if given migrate %p`, migrate => {
    expect.assertions(1);
    expect(() => validateContentMigration({ ...VALID.CONTENT_MIGRATIONS[0], migrate })).toThrow(ValidationError.name);
  });
});


describe('Testing validateContentMigrationPath()', () => {
  it.each(VALID.CONTENT_MIGRATION_PATHS)('should not throw an error if given %p', value => {
    expect.assertions(1);
    expect(() => validateContentMigrationPath(value)).not.toThrow();
  });

  it.each(INVALID.OBJECTS)(`should throw ValidationError if given %p`, value => {
    expect.assertions(1);
    expect(() => validateContentMigrationPath(value)).toThrow(ValidationError.name);
  });

  it.each(INVALID.CONTENT_TYPES)(`should throw ValidationError if given from %p`, from => {
    expect.assertions(1);
    expect(() => validateContentMigrationPath({ ...VALID.CONTENT_MIGRATION_PATHS[0], from })).toThrow(ValidationError.name);
  });

  it.each(INVALID.CONTENT_TYPES)(`should throw ValidationError if given to %p`, to => {
    expect.assertions(1);
    expect(() => validateContentMigrationPath({ ...VALID.CONTENT_MIGRATION_PATHS[0], to })).toThrow(ValidationError.name);
  });

  it.each(INVALID.CONTENT_MIGRATIONS)(`should throw ValidationError if given migrations %p`, migrations => {
    expect.assertions(1);
    expect(() => validateContentMigrationPath({ ...VALID.CONTENT_MIGRATION_PATHS[0], migrations })).toThrow(ValidationError.name);
  });
});


describe('Testing validateContentAnalyzer()', () => {
  it.each(VALID.CONTENT_ANALYZERS)('should not throw an error when given %p', value => {
    expect.assertions(1);
    expect(() => validateContentAnalyzer(value)).not.toThrow();
  });

  it.each(INVALID.OBJECTS)('should throw ValidationError when given %p', value => {
    expect.assertions(1);
    expect(() => validateContentAnalyzer(value)).toThrow(ValidationError.name);
  });

  it.each(INVALID.OBJECTS)('should throw ValidationError when given contentTypes %p', contentTypes => {
    expect.assertions(1);
    expect(() => validateContentAnalyzer({ ...VALID.CONTENT_ANALYZERS[0], contentTypes })).toThrow(ValidationError.name);
  });

  it.each(INVALID.CONTENT_TYPES)('should throw ValidationError when given contentTypes [%p]', value => {
    expect.assertions(1);
    expect(() => validateContentAnalyzer({ ...VALID.CONTENT_ANALYZERS[0], contentTypes: [value] })).toThrow(ValidationError.name);
  });

  it.each(INVALID.ANALYZES)('should throw ValidationError when given analyze [%p]', analyze => {
    expect.assertions(1);
    expect(() => validateContentAnalyzer({ ...VALID.CONTENT_ANALYZERS[0], analyze })).toThrow(ValidationError.name);
  });
});