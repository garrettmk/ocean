import { parseContentType } from "../utils/content-type-utils";

export const unknownContentType = Object.freeze({
  ...parseContentType('unknown/unknown'),
  name: 'Unknown Content Type'
});


export type UnknwonContent = unknown;