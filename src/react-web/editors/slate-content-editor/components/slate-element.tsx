import { Link } from '@chakra-ui/react';
import { RenderElementProps } from "slate-react";


export function SlateElement({
  element,
  attributes,
  children
}: RenderElementProps) : JSX.Element {
  switch (element.type) {
    case 'paragraph':
      return <p {...attributes}>{children}</p>;

    case 'heading':
      switch (element.level) {
        case 1:
          return <h1 {...attributes}>{children}</h1>;
        case 2:
          return <h2 {...attributes}>{children}</h2>;
        case 3:
          return <h3 {...attributes}>{children}</h3>;
        case 4:
          return <h4 {...attributes}>{children}</h4>;
        case 5:
          return <h5 {...attributes}>{children}</h5>;
        case 6:
          return <h6 {...attributes}>{children}</h6>;
        default:
          return <h1 {...attributes}>{children}</h1>;
      }
    
    case 'link':
      return <Link {...attributes} href={element.url}>{children}</Link>;

    default:
      return <p {...attributes}>{children}</p>;
  }
}