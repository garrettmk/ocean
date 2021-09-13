import { parseMIMEType, ContentType } from "@/domain";


export function parseContentType(value: string) : ContentType {
  const mimeType = parseMIMEType(value);
  
  return {
    name: value,
    value,
    type: mimeType.type,
    subType: mimeType.subType,
    parameter: mimeType.parameter,
    parameterValue: mimeType.value
  };
}