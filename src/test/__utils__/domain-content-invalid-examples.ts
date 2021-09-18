import * as VALID from './domain-content-valid-examples';
import * as INVALID from './domain-invalid-examples';

export { OBJECTS, CONTENT_TYPES } from './domain-invalid-examples';


export const NAMES = INVALID.NONEMPTY_STRINGS;;
export const VALUES = INVALID.CONTENT_TYPES;
export const TYPES = INVALID.NONEMPTY_STRINGS;
export const SUBTYPES = INVALID.NONEMPTY_STRINGS;
export const PARAMETERS = INVALID.OPTIONAL_NONEMPTY_STRINGS;
export const PARAMETER_VALUES = INVALID.OPTIONAL_NONEMPTY_STRINGS;
export const MIGRATES = INVALID.FUNCS;
export const ANALYZES = INVALID.FUNCS;


export const PARSED_CONTENT_TYPES: any[] = INVALID.OBJECTS
  .concat(NAMES.map(name => ({ ...VALID.PARSED_CONTENT_TYPES[0], name })))
  .concat(VALUES.map(value => ({ ...VALID.PARSED_CONTENT_TYPES[0], value })))
  .concat(TYPES.map(type => ({ ...VALID.PARSED_CONTENT_TYPES[0], type })))
  .concat(SUBTYPES.map(subType => ({ ...VALID.PARSED_CONTENT_TYPES[0], subType })))
  .concat(PARAMETERS.map(parameter => ({ ...VALID.PARSED_CONTENT_TYPES[0], parameter })))
  .concat(PARAMETER_VALUES.map(parameter => ({ ...VALID.PARSED_CONTENT_TYPES[1], parameter })))
  .concat(PARAMETER_VALUES.map(parameterValue => ({ ...VALID.PARSED_CONTENT_TYPES[0], parameterValue })));


export const CONTENT_MIGRATIONS: any[] = INVALID.OBJECTS
  .concat(PARSED_CONTENT_TYPES.map(from => ({ ...VALID.CONTENT_MIGRATIONS[0], from })))
  .concat(PARSED_CONTENT_TYPES.map(to => ({ ...VALID.CONTENT_MIGRATIONS[0], to })))
  .concat(MIGRATES.map(migrate => ({ ...VALID.CONTENT_MIGRATIONS[0], migrate })));


export const CONTENT_MIGRATION_PATHS: any[] = INVALID.OBJECTS
  .concat(PARSED_CONTENT_TYPES.map(from => ({ ...VALID.CONTENT_MIGRATION_PATHS[0], from })))
  .concat(PARSED_CONTENT_TYPES.map(to => ({ ...VALID.CONTENT_MIGRATION_PATHS[0], to })))
  .concat(CONTENT_MIGRATIONS.map(migrations => ({ ...VALID.CONTENT_MIGRATION_PATHS, migrations: [migrations] })));


export const CONTENT_ANALYZERS: any[] = INVALID.OBJECTS
  .concat(INVALID.CONTENT_TYPES.map(type => ({ ...VALID.CONTENT_ANALYZERS[0], contentTypes: [type] })))
  .concat(ANALYZES.map(analyze => ({ ...VALID.CONTENT_ANALYZERS[0], analyze })));