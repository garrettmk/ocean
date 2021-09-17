import { ContentAnalysis, ContentAnalyzer, ContentMigration, ContentMigrationPath, ContentType } from "./domain-content-models";
import { func, assign, boolean, object, optional, pattern, refine, string, union, unknown, type, array, number, nullable, literal, record, any } from 'superstruct';
import { mimeTypeRegex, validate } from './domain-utils';


const ContentTypeSchema = pattern(string(), mimeTypeRegex);
const NonEmptyString = refine(string(), 'nonemptystring', value => value.length > 0);


const ParsedContentTypeSchema = union([
  object({
    name: NonEmptyString,
    value: ContentTypeSchema,
    type: NonEmptyString,
    subType: NonEmptyString,
  }),

  object({
    name: NonEmptyString,
    value: ContentTypeSchema,
    type: NonEmptyString,
    subType: NonEmptyString,
    parameter: NonEmptyString,
    parameterValue: NonEmptyString,
  }),
]);


export function validateParsedContentType(value: any) : asserts value is ContentType {
  validate(value, ParsedContentTypeSchema);
}


const ContentMigrationSchema = type({
  from: ParsedContentTypeSchema,
  to: ParsedContentTypeSchema,
  migrate: func()
});

export function validateContentMigration(value: any) : asserts value is ContentMigration {
  validate(value, ContentMigrationSchema);
}


const ContentMigrationPathSchema = type({
  from: ParsedContentTypeSchema,
  to: ParsedContentTypeSchema,
  migrations: array(ContentMigrationSchema)
});

export function validateContentMigrationPath(value: any) : asserts value is ContentMigrationPath {
  validate(value, ContentMigrationPathSchema);
}


const OutboundLinkSchema = type({
  url: string()
});

const ContentAnalysisSchema = type({
  subject: optional(array(string())),
  links: optional(array(OutboundLinkSchema))
});

export function validateContentAnalysis(value: any) : asserts value is ContentAnalysis {
  validate(value, ContentAnalysisSchema);
}


const ContentAnalyzerSchema = type({
  contentTypes: array(ContentTypeSchema),
  analyze: func()
});

export function validateContentAnalyzer(value: any) : asserts value is ContentAnalyzer {
  validate(value, ContentAnalyzerSchema);
}