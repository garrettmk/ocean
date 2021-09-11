import React from 'react';
import { RenderLeafProps } from 'slate-react';


export function Leaf({
  leaf,
  attributes,
  children
}: RenderLeafProps) : JSX.Element {
  const style: React.StyleHTMLAttributes<HTMLSpanElement> = {

  };

  if (leaf.bold)
    children = <strong>{children}</strong>;
  
  return <span style={style} {...attributes}>{children}</span>;
}
