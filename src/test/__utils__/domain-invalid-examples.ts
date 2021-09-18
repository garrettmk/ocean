import * as VALID from './domain-valid-examples';


export const NONEMPTY_STRINGS: any[] = [undefined, null, NaN, 0, 123, '', {}, [], () => null];
export const OPTIONAL_NONEMPTY_STRINGS: any[] = NONEMPTY_STRINGS.filter(v => v === undefined);
export const OBJECTS: any[] = [undefined, null, NaN, 0, 123, '', 'a string', () => null];
export const FUNCS: any[] = [undefined, null, NaN, 0, 123, '', 'a string', {}, []];
export const CONTENT_TYPES: any[] = [
  undefined, 
  null, 
  NaN, 
  0, 
  123, 
  '',
  'text',
  'text-plain',
  'text/',
  '&text/$plain',
  'text/plain;',
  'text/plain;foo',
  'text/plain;foo='
];

export const IDS: any[] = NONEMPTY_STRINGS;
export const NAMES: any[] = NONEMPTY_STRINGS;

export const AUTHORS: any[] = OBJECTS
  .concat(IDS.map(id => ({ ...VALID.AUTHORS[0], id })))
  .concat(NAMES.map(name => ({ ...VALID.AUTHORS[0], name })));

export const TITLES: any[] = NONEMPTY_STRINGS;

export const DOCUMENT_LINK_METAS: any[] = [
  ...OBJECTS,
  { method: () => null }
];