import * as VALID from './domain-content-valid-examples';


export const NONEMPTY_STRINGS: any[] = [undefined, null, NaN, 0, 123, '', {}, [], () => null];
export const OPTIONAL_NONEMPTY_STRINGS: any[] = NONEMPTY_STRINGS.filter(v => v === undefined);
export const OBJECTS: any[] = [undefined, null, NaN, 0, 123, '', 'a string', () => null];
export const FUNCS: any[] = [undefined, null, NaN, 0, 123, '', 'a string', {}, []];

export const NAMES = [undefined, null, NaN, {}, [], 0, 123, ''];
export const VALUES = [undefined, null, NaN, {}, [], 0, 123, '', 'text', 'text/', 'text/plain/etc'];
export const TYPES = [undefined, null, NaN, {}, [], 0, 123, ''];
export const SUBTYPES = NONEMPTY_STRINGS;
export const PARAMETERS = NONEMPTY_STRINGS;
export const PARAMETER_VALUES = NONEMPTY_STRINGS;
export const MIGRATES = FUNCS;


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


export const PARSED_CONTENT_TYPES: any[] = (OBJECTS as any[])
  .concat(NONEMPTY_STRINGS.map(name => ({ ...VALID.PARSED_CONTENT_TYPES[0], name })))
  .concat(CONTENT_TYPES.map(value => ({ ...VALID.PARSED_CONTENT_TYPES[0], value })))
  .concat(NONEMPTY_STRINGS.map(type => ({ ...VALID.PARSED_CONTENT_TYPES[0], type })))
  .concat(NONEMPTY_STRINGS.map(subType => ({ ...VALID.PARSED_CONTENT_TYPES[0], subType })))
  .concat(OPTIONAL_NONEMPTY_STRINGS.map(parameter => ({ ...VALID.PARSED_CONTENT_TYPES[0], parameter })))
  .concat(NONEMPTY_STRINGS.map(parameter => ({ ...VALID.PARSED_CONTENT_TYPES[1], parameter })))
  .concat(OPTIONAL_NONEMPTY_STRINGS.map(parameterValue => ({ ...VALID.PARSED_CONTENT_TYPES[0], parameterValue })))
  .concat(NONEMPTY_STRINGS.map(parameterValue => ({ ...VALID.PARSED_CONTENT_TYPES[1], parameterValue })));


export const CONTENT_MIGRATIONS: any[] = (OBJECTS as any[])
  .concat(PARSED_CONTENT_TYPES.map(from => ({ ...VALID.CONTENT_MIGRATIONS[0], from })))
  .concat(PARSED_CONTENT_TYPES.map(to => ({ ...VALID.CONTENT_MIGRATIONS[0], to })))
  .concat(FUNCS.map(migrate => ({ ...VALID.CONTENT_MIGRATIONS[0], migrate })));


export const CONTENT_MIGRATION_PATHS: any[] = OBJECTS
  .concat(PARSED_CONTENT_TYPES.map(from => ({ ...VALID.CONTENT_MIGRATION_PATHS[0], from })))
  .concat(PARSED_CONTENT_TYPES.map(to => ({ ...VALID.CONTENT_MIGRATION_PATHS[0], to })))
  .concat(CONTENT_MIGRATIONS.map(migrations => ({ ...VALID.CONTENT_MIGRATION_PATHS, migrations: [migrations] })));


export const CONTENT_ANALYZERS: any[] = OBJECTS
  .concat(CONTENT_TYPES.map(type => ({ ...VALID.CONTENT_ANALYZERS[0], contentTypes: [type] })))
  .concat(FUNCS.map(analyze => ({ ...VALID.CONTENT_ANALYZERS[0], analyze })));