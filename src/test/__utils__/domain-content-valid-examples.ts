import { parseContentType } from "@/content/utils";
import { ContentAnalyzer, ContentMigration, ContentMigrationPath, ContentType } from "@/domain";
import * as VALID from './domain-valid-examples';


export const PARSED_CONTENT_TYPES: ContentType[] = VALID.CONTENT_TYPES.map(parseContentType);

export const CONTENT_MIGRATIONS: ContentMigration[] = [
  {
    from: PARSED_CONTENT_TYPES[0],
    to: PARSED_CONTENT_TYPES[1],
    migrate: jest.fn().mockReturnValue(`content in ${PARSED_CONTENT_TYPES[1].subType}`)
  },
  {
    from: PARSED_CONTENT_TYPES[1],
    to: PARSED_CONTENT_TYPES[2],
    migrate: jest.fn().mockReturnValue(`content in ${PARSED_CONTENT_TYPES[2].subType}`)
  },
  {
    from: PARSED_CONTENT_TYPES[2],
    to: PARSED_CONTENT_TYPES[3],
    migrate: jest.fn().mockReturnValue(`content in ${PARSED_CONTENT_TYPES[3].subType}`)
  },
  {
    from: PARSED_CONTENT_TYPES[0],
    to: PARSED_CONTENT_TYPES[2],
    migrate: jest.fn().mockReturnValue(`content in ${PARSED_CONTENT_TYPES[2].subType}`)
  }
];


export const CONTENT_MIGRATION_PATHS_FROM_0: ContentMigrationPath[] = [
  {
    from: PARSED_CONTENT_TYPES[0],
    to: PARSED_CONTENT_TYPES[1],
    migrations: [CONTENT_MIGRATIONS[0]]
  },
  {
    from: PARSED_CONTENT_TYPES[0],
    to: PARSED_CONTENT_TYPES[2],
    migrations: [CONTENT_MIGRATIONS[3]]
  },
  {
    from: PARSED_CONTENT_TYPES[0],
    to: PARSED_CONTENT_TYPES[3],
    migrations: [CONTENT_MIGRATIONS[3], CONTENT_MIGRATIONS[2]]
  }
];

export const CONTENT_MIGRATION_PATHS_0_TO_3: ContentMigrationPath[] = [
  {
    from: PARSED_CONTENT_TYPES[0],
    to: PARSED_CONTENT_TYPES[3],
    migrations: [CONTENT_MIGRATIONS[3], CONTENT_MIGRATIONS[2]]
  }
];

export const CONTENT_MIGRATION_PATHS: ContentMigrationPath[] = [
  {
    from: CONTENT_MIGRATIONS[0].from,
    to: CONTENT_MIGRATIONS[2].to,
    migrations: [CONTENT_MIGRATIONS[3], CONTENT_MIGRATIONS[2]]
  }
];

export const CONTENT_ANALYZERS: ContentAnalyzer[] = [
  {
    contentTypes: [VALID.CONTENT_TYPES[0]],
    analyze: jest.fn().mockReturnValue({
      subject: [],
      links: []
    })
  },
  {
    contentTypes: [VALID.CONTENT_TYPES[3]],
    analyze: jest.fn().mockReturnValue({
      subject: [],
      links: []
    })
  }
];