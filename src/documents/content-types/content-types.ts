import { parseContentType } from "../utils/content-type-utils";


export const textPlain = Object.freeze(parseContentType('text/plain'));
export const textMarkdown = Object.freeze(parseContentType('text/markdown'));
export const textHTML = Object.freeze(parseContentType('text/html'));
export const slate001 = Object.freeze(parseContentType('application/json;format=slate001'));
export const slate002 = Object.freeze(parseContentType('application/json;format=slate002'));
export const applicationJSON = Object.freeze(parseContentType('application/json'));