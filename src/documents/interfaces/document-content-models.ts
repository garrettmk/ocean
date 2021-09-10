

// The parsed contentType
export type ContentType = {
  value: string,
  type: string,
  subType: string,
  parameter?: string,
  parameterValue?: string,
}


// A migration between content types
export interface ContentTypeMigration {
  name: string,
  from: ContentType,
  to: ContentType,

  up(content: any) : Promise<any>,
  down(content: any) : Promise<any>
}

// Describes a list of migrations from one content type to another
export type ContentTypeMigrationPath = {
  from: ContentType,
  to: ContentType,
  migrations: ContentTypeMigration[]
}


// Manages migrations
export interface ContentMigrationManager {
  registerMigration(migration: ContentTypeMigration, replace?: boolean) : Promise<boolean>,
  listAllMigrations() : Promise<ContentTypeMigration[]>,
  listAvailableMigrations(from: ContentType) : Promise<ContentTypeMigration[]>,
  getMigrationPaths(from: ContentType, to: ContentType) : Promise<ContentTypeMigrationPath[]>,
  migrate(content: any, path: ContentTypeMigrationPath, direction?: 'up' | 'down') : Promise<any> 
}
