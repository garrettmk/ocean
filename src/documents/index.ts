export * from './interfaces';
export * from './content-types';
export * from './migrations';

import * as migrationClasses from './migrations';
export const defaultMigrations = Object.values(migrationClasses).map(migrationClass => new migrationClass());
