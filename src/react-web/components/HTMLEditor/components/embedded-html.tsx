import { Box, BoxProps } from '@chakra-ui/layout';
import React from 'react';


export type EmbeddedHTMLProps = BoxProps & {
  html: string,
  onChange?: (newHtml: string) => void,
}


export const EmbeddedHTML = React.forwardRef<HTMLDivElement, EmbeddedHTMLProps>((props, forwardedRef) => {
  const { html, onChange, ...boxProps } = props;

  // The shadow host
  const ref = React.useRef<HTMLDivElement>(null);

  // Keep the forwarded ref up to date
  React.useEffect(() => {
    if (forwardedRef && typeof forwardedRef === 'function')
      forwardedRef(ref.current);
    else if (forwardedRef && typeof forwardedRef === 'object')
      forwardedRef.current = ref.current;
  }, [ref.current]);
  
  // Attach a shadow dom to hold the html content
  React.useEffect(() => {
    if (ref.current && !ref.current.shadowRoot) {
      ref.current.attachShadow({ mode: 'open' });
    }
  }, [ref.current]);

  // Update the shadow dom's inner html when the html prop changes
  React.useEffect(() => {
    if (ref.current?.shadowRoot && html !== ref.current.shadowRoot.innerHTML) {
      const template = document.createElement('template');
      template.innerHTML = html;
      ref.current.shadowRoot.replaceChildren(template.content);
    }
  }, [html]);

  // Observe changes in the shadow dom
  const observer = React.useMemo(() => new MutationObserver((mutations) => {
    if (mutations[0].attributeName === 'contenteditable')
      return;

    onChange?.(ref.current!.shadowRoot!.innerHTML);
  }), [onChange]);
  
  React.useEffect(() => {
    if (ref.current) {
      observer.observe(ref.current.shadowRoot!, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true
      });
  
      return () => observer.disconnect();
    }
  }, [ref.current]);

  return (
    <Box 
      ref={ref}
      {...boxProps}
    />
  );
});