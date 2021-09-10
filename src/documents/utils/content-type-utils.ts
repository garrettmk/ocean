import { parseMIMEType } from "@/domain";
import { ContentType } from "../interfaces/document-content-models";


export function parseContentType(value: string) : ContentType {
  const mimeType = parseMIMEType(value);
  
  return {
    value,
    type: mimeType.type,
    subType: mimeType.subType,
    parameter: mimeType.parameter,
    parameterValue: mimeType.value
  };
}