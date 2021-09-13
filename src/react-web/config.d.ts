import { ID } from '@/domain'
import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'


declare module 'slate' {
  type ParagraphElement = { type: 'paragraph'; children: CustomText[] };
  type HeadingElement = { type: 'heading', children: CustomText[], level: 1 | 2 | 3 | 4 | 5 | 5 | 6 };
  type LinkElement = { type: 'link', children: CustomText[], url?: string };
  type CustomText = {
    text: string,
    bold?: boolean,
    italic?: boolean
    underline?: boolean,
    strikethrough?: boolean
  }
  type Mark = keyof Omit<CustomText, 'text'>;

  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & {
      isFormatActive(format: Mark) : boolean,
      toggleFormat(format: Mark) : boolean,
        
        isLinkActive() : boolean,
        wrapLink(url?: string) : void,
        unwrapLink() : void,
      }

    Element: ParagraphElement | HeadingElement | LinkElement

    Text: CustomText
  }
}