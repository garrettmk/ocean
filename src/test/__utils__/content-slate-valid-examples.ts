import { ParagraphElement, TextElement, HeadingElement, LinkElement, SlateContent } from "@/content/content-types/content-type-slate";


export const TEXT_ELEMENTS: TextElement[] = [
  {
    text: 'some text'
  },
];


export const PARAGRAPH_ELEMENTS: ParagraphElement[] = [
  {
    type: 'paragraph',
    children: []
  },
  {
    type: 'paragraph',
    children: TEXT_ELEMENTS
  }
];


export const HEADING_LEVELS: HeadingElement['level'][] = [
  1, 2, 3, 4, 5, 6
];


export const HEADING_ELEMENTS: HeadingElement[] = HEADING_LEVELS.map(level => ({
  type: 'heading',
  level,
  children: TEXT_ELEMENTS
}));


export const LINK_ELEMENTS: LinkElement[] = [
  {
    type: 'link',
    children: []
  },
  {
    type: 'link',
    url: 'somewhere',
    children: TEXT_ELEMENTS
  }
];

export const CONTENT: SlateContent = [
  ...PARAGRAPH_ELEMENTS,
  ...HEADING_ELEMENTS,
  ...LINK_ELEMENTS
];