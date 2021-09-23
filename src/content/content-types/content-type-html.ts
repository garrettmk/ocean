import { parseContentType } from "../utils/content-type-utils";

export const htmlContentType = Object.freeze({
  ...parseContentType('text/html'),
  name: 'HTML'
});


export type HTMLContent = string;