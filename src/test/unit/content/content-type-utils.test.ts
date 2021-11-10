import { parseContentType, isSameType, isSameSubType } from "@/content/utils";
import { validateParsedContentType, ValidationError } from '@/domain';
import * as VALID from '../../__utils__/domain-valid-examples';
import * as INVALID from '../../__utils__/domain-invalid-examples';


describe('testing parseContentType()', () => {
  it.each(VALID.CONTENT_TYPES)('should return a valid ContentType when given %p', value => {
    expect.assertions(1);

    const result = parseContentType(value);

    expect(() => validateParsedContentType(result)).not.toThrow();
  });

  it.each(INVALID.CONTENT_TYPES)('should throw ValidationError when given %p', value => {
    expect.assertions(1);

    expect(() => parseContentType(value)).toThrowError(ValidationError.name);
  });

  it.each([
    ['text/html', { type: 'text', subType: 'html' }],
    ['image/png', { type: 'image', subType: 'png' }],
  ])('should correctly parse the content type', (value, expected) => {
    expect.assertions(1);

    expect(parseContentType(value)).toMatchObject(expected);
  });
});



describe('testing isSameType', () => {
  it.each([
    ['text/css', 'text/css'],
    ['text/html', 'text/csv'],
    ['text/html', 'text/html;charset=UTF-8']
  ])('should return true for %p and %p', (a, b) => {
    expect.assertions(1);
    expect(isSameType(a, b)).toBeTruthy();
  });

  it.each([
    ['text/css', 'image/png'],
    ['text/html', 'application/javascript']
  ])('should return false for %p and %p', (a, b) => {
    expect.assertions(1);
    expect(isSameType(a, b)).toBeFalsy();
  });
});


describe('testing isSameSubType()', () => {
  it.each([
    ['text/css', 'text/css;charset=UTF-8'],
    ['application/json', 'application/json;format=slate1']
  ])('should return true for %p and %p', (a, b) => {
    expect.assertions(1);
    expect(isSameSubType(a, b)).toBeTruthy();
  });

  it.each([
    ['text/css', 'text/html'],
    ['image/jpeg', 'image/png']
  ])('should return false for %p and %p', (a, b) => {
    expect.assertions(1);
    expect(isSameSubType(a, b)).toBeFalsy();
  });
});