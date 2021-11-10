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


export function isSameType(a: string, b: string) : boolean {
  const { type: typeA } = parseContentType(a);
  const { type: typeB } = parseContentType(b);

  return typeA === typeB;
}


export function isSameSubType(a: string, b: string) : boolean {
  const { type: typeA, subType: subTypeA } = parseContentType(a);
  const { type: typeB, subType: subTypeB } = parseContentType(b);

  return typeA === typeB && subTypeA === subTypeB;
}