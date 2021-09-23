import { ID } from '@/domain'
import { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'
import { SlateElement, TextElement } from '@/content/content-types/content-type-slate';
import React from 'react';


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


declare global {
  namespace JSX {
    interface IntrinsicElements {
    'embedded-html': React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLElement> & {
        html: string
      }
    }
  }
}