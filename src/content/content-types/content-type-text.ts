import { parseContentType } from "../utils/content-type-utils";

export const textContentType = Object.freeze({
  ...parseContentType('text/plain'),
  name: 'Plain Text'
});


export type TextContent = string;