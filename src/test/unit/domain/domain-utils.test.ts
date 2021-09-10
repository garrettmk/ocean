import { ValidationError } from "@/domain";
import { parseMIMEType } from "@/domain/domain-utils";


const VALID_MIME_TYPES = [
  'text/plain',
  'application/json',
  'application/x-javascript',
  'application/json;format=ocean-123'
];


const INVALID_MIME_TYPES = [
  null,
  undefined,
  NaN,
  0,
  123,
  '',
  'text',
  'text/',
  'text/plain;'
];


describe('Testing parseMIMEType()', () => {
  it.each(VALID_MIME_TYPES)('should correctly parse valid MIME types', value => {
    const expectedMimeType = value.split(';')[0];
    const expectedParameterName = value.split(';')[1]?.split('=')?.[0];
    const expectedParameterValue = value.split(';')[1]?.split('=')?.[1];

    const result = parseMIMEType(value);

    expect(result.mimeType).toBe(expectedMimeType);
    if (expectedParameterName) {
      expect(result.parameter).toHaveProperty(expectedParameterName);
      expect(result.parameter[expectedParameterName]).toBe(expectedParameterValue);
    }
  });


  it.each(INVALID_MIME_TYPES)('should throw ValidationError if given: %p', value => {
    expect.assertions(1);
    expect(() => parseMIMEType(value as string)).toThrow(ValidationError.name)
  })
})