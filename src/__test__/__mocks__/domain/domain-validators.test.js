import { validateAuthor } from '@/domain';
import { ValidationError } from 'webpack';


describe('Testing validateAuthor()', () => {
  it.each([
    null,
    undefined,
    678,
    'a string',
    [],
    {},
    {
      id: 898,
      name: 'klj'
    },
    {
      id: '',
      name: 'lkj',
    },
    {
      id: '8',
      name: 897,
    },
    {
      id: 'j',
      name: 'iou',
      extra: 'lkj'
    }
  ])('should throw ValidationError', (value) => {
    expect(() => validateAuthor(value)).toThrow(ValidationError.name);
  });

  it('should pass', () => {
    const value = { id: 'valid', name: 'valid' };

    expect(() => validateAuthor(value)).not.toThrow(ValidationError.name);
  });
})