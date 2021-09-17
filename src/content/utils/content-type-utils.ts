import { parseMIMEType, ContentType } from "@/domain";


export function parseContentType(value: string) : ContentType {
  const mimeType = parseMIMEType(value);

  const result: ContentType = {
    name: value,
    value,
    type: mimeType.type,
    subType: mimeType.subType,
  }

  if (mimeType.parameter) {
    result.parameter = mimeType.parameter,
    result.parameterValue = mimeType.value
  }
  
  return result;
}