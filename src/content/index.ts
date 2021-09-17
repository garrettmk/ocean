export * from './interfaces';
export * from './content-types';
export * from './migrations';

import * as migrationClasses from './migrations';
export const defaultMigrations = Object.values(migrationClasses).map(migrationClass => new migrationClass());

import * as contentAnalyzers from './analyzers';
export const defaultAnalyzers = Object.values(contentAnalyzers).map(analyzerClass => new analyzerClass());