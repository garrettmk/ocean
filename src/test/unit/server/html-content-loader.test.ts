import { HtmlContentLoader } from "@/server/content/html-content-loader";

describe('Testing HtmlContentLoader', () => {

  describe('testing supportsContentType()', () => {
    it.each([
      'text/html',
      'text/html;charset=UTF-8'
    ])('should return true for %p', value => {
      expect.assertions(1);
      expect(HtmlContentLoader.supportsContentType(value)).toBeTruthy();
    });

    it.each([
      'image/jpeg',
      'application/json'
    ])('should return false for %p', value => {
      expect.assertions(1);
      expect(HtmlContentLoader.supportsContentType(value)).toBeFalsy();
    });
  });


  describe('testing constructor', () => {
    it('should be able to create a loader with an empty string', () => {
      expect.assertions(1);

      expect(() => new HtmlContentLoader('')).not.toThrow();
    });
  });
});