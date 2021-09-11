import { ID } from '@/domain'
import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'

type CustomElement = 
  | { type: 'paragraph'; children: CustomText[] }
  | { type: 'heading', children: CustomText[], level: 1 | 2 | 3 | 4 | 5 | 5 | 6 }
  | { type: 'link', children: CustomText[], url: string };


type CustomText = {
  text: string,
  bold?: boolean, 
}

type Mark = keyof Omit<CustomText, 'text'>;


type CustomEditor = BaseEditor & ReactEditor & {
  isFormatActive(format: Mark) : boolean,
  toggleFormat(format: Mark) : boolean,
}
declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
  }
}