
// The parsed contentType
export type ContentType = {
  name: string,
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

  migrate(content: any) : Promise<any>,
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
  listNextMigrations(from: ContentType) : Promise<ContentTypeMigration[]>,
  getMigrationPaths(from: ContentType, to?: ContentType) : Promise<ContentTypeMigrationPath[]>,
  migrate(content: any, path: ContentTypeMigrationPath, direction?: 'up' | 'down') : Promise<any> 
}

// Content analysis
export type ContentAnalysis = {
  subject?: string[],
  links?: OutboundLink[]
}

export type OutboundLink = {
  url: string
}

export interface ContentAnalyzer {
  contentTypes: string[],
  analyze(contentType: string, content: any) : Promise<ContentAnalysis>
}


export interface ContentAnalysisManager {
  registerAnalyzer(analyzer: ContentAnalyzer, replace?: boolean) : Promise<boolean>,
  listAllAnalyzers() : Promise<ContentAnalyzer[]>,
  getAnalyzer(contentType: string) : Promise<ContentAnalyzer>,
  analyze(contentType: string, content: any) : Promise<ContentAnalysis>
}