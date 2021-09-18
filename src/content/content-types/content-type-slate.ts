
import { parseContentType } from '../utils/content-type-utils';


export type ParagraphElement = { type: 'paragraph'; children: TextElement[] };
export type HeadingElement = { type: 'heading', children: TextElement[], level: 1 | 2 | 3 | 4 | 5 | 5 | 6 };
export type LinkElement = { type: 'link', children: TextElement[], url?: string };
export type TextElement = {
  text: string,
  bold?: boolean,
  italic?: boolean
  underline?: boolean,
  strikethrough?: boolean
}
export type Mark = keyof Omit<TextElement, 'text'>;

export type SlateElement = ParagraphElement | HeadingElement | LinkElement;

export type SlateContent = SlateElement[];

export const slateContentType = Object.freeze({ ...parseContentType('application/json;format=slate001'), name: 'Slate v1' });
