import React from 'react';
import { RenderLeafProps } from 'slate-react';


export function SlateLeaf({
  leaf,
  attributes,
  children
}: RenderLeafProps) : JSX.Element {
  const style: React.StyleHTMLAttributes<HTMLSpanElement> = {

  };

  if (leaf.bold)
    children = <strong>{children}</strong>;

  if (leaf.italic)
    children = <em>{children}</em>;
  
  if (leaf.underline)
    children = <u>{children}</u>;

  if (leaf.strikethrough)
    children = <del>{children}</del>;
  
  return <span style={style} {...attributes}>{children}</span>;
}
