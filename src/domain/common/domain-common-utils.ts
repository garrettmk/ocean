import { assert, Struct, StructError } from "superstruct";
import { ValidationError } from "./domain-errors";


// type/subtype;parameter=value
export const mimeTypeRegex = /(^[a-zA-Z0-9_\-]+\/[a-zA-Z0-9_\-]+)(?:;\s*([a-zA-Z0-9_\-]+=[a-zA-Z0-9_\-]+))?$/;


// Parses a MIME type
export type ParsedMIMEType = {
  type: string,
  subType: string,
  parameter?: string,
  value?: string
}

export function parseMIMEType(contentType: string) : ParsedMIMEType {
  const match = typeof contentType === 'string' && contentType.match(mimeTypeRegex);
  if (!match)
    throw new ValidationError(
      `invalid MIME type: ${contentType}`,
      ['contentType'],
      'pattern matching type/subtype;parameter=value',
      contentType
    );

  const [fullMatch, mimeType, param] = match;
  const [type, subType] = mimeType.split('/');
  const [parameter, value] = param?.split('=') ?? [];

  return {
    type,
    subType,
    parameter,
    value
  };  
}

// Validates a value using a superstruct schema, and transforms
// StructErrors into ValidationErrors
export function validate(value: any, schema: Struct<any, any>) {
  try {
    assert(value, schema);
  } catch (e) {
    if (e instanceof StructError) {
      // Trim the StructError name from the beginning of the message
      const match = e.message.match(/StructError: (.*)/);
      const message = match ? match[1] : e.message;

      // Re-throw as a ValidationError
      throw new ValidationError(
        message,
        e.path,
        e.type,
        e.value
      );

    } else {
      throw e;
    }
  }
}