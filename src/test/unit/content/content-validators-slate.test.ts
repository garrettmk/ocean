import { validateSlateContent } from '@/content/validators';
import * as VALID from '../../__utils__/content-slate-valid-examples';


describe('Testing validateSlateContent', () => {
  it('should not throw an error when given valid content', () => {
    expect.assertions(1);
    expect(() => validateSlateContent(VALID.CONTENT)).not.toThrow();
  });
});