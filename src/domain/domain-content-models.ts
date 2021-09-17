
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
export interface ContentMigration {
  from: ContentType,
  to: ContentType,

  migrate(content: any) : Promise<any>,
}

// Describes a list of migrations from one content type to another
export type ContentMigrationPath = {
  from: ContentType,
  to: ContentType,
  migrations: ContentMigration[]
}


// Manages migrations
export interface ContentMigrationManager {
  registerMigration(migration: ContentMigration, replace?: boolean) : Promise<boolean>,
  listAllMigrations() : Promise<ContentMigration[]>,
  listNextMigrations(from: ContentType) : Promise<ContentMigration[]>,
  getMigrationPaths(from: ContentType, to?: ContentType) : Promise<ContentMigrationPath[]>,
  migrate(content: any, path: ContentMigrationPath, direction?: 'up' | 'down') : Promise<any> 
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