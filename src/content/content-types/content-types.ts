import { parseContentType } from "../utils/content-type-utils";


export const textPlain = Object.freeze({ ...parseContentType('text/plain'), name: 'Plain text' });
export const textMarkdown = Object.freeze({ ...parseContentType('text/markdown'), name: 'Markdown' });
export const textHTML = Object.freeze({ ...parseContentType('text/html'), name: 'HTML' });
export const slate001 = Object.freeze({ ...parseContentType('application/json;format=slate001'), name: 'Slate v1' });
export const slate002 = Object.freeze({ ...parseContentType('application/json;format=slate002'), name: 'Slate v2' });
export const applicationJSON = Object.freeze({ ...parseContentType('application/json'), name: 'JSON' });