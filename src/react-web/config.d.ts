import { ID } from '@/domain'
import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'
import { SlateElement, TextElement } from '@/content/content-types/content-type-slate';


declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & {
      isFormatActive(format: Mark) : boolean,
      toggleFormat(format: Mark) : boolean,
        
      isLinkActive() : boolean,
      wrapLink(url?: string) : void,
      unwrapLink() : void,
    }

    Element: SlateElement,

    Text: TextElement
  }
}