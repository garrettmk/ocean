import React from 'react';


export type EmbeddedHTMLRef = React.RefObject<HTMLDivElement>;


export type SelectionBehavior = ReturnType<typeof useSelectionBehavior>;

export function useSelectionBehavior(embed: EmbeddedHTMLRef) {
  const [isActive, setIsActive] = React.useState(false);
  const [hoveredElement, setHoveredElement] = React.useState<HTMLElement | null>(null);
  const [selectedElement, setSelectedElement] = React.useState<HTMLElement | null>(null);

  const hoverElement = React.useCallback((event: Event) => {
    setHoveredElement(event.target as HTMLElement);
  }, []);

  const unhoverElement = React.useCallback((event: Event) => {
    setHoveredElement(null);
  }, []);

  const selectElement = React.useCallback((event: Event) => {
    setSelectedElement(event.target as HTMLElement);
    setHoveredElement(null);
  }, []);


  const start = React.useCallback(() => {
    const { current } = embed;
    if (!current) return;
    
    current.shadowRoot!.addEventListener('mouseover', hoverElement);
    current.shadowRoot!.addEventListener('mouseout', unhoverElement);
    current.shadowRoot!.addEventListener('click', selectElement);

    setHoveredElement(null);
    setSelectedElement(null);
    setIsActive(true);
  }, []);

  const stop = React.useCallback(() => {
    const { current } = embed;
    if (!current) return;

    current.shadowRoot!.removeEventListener('mouseover', hoverElement);
    current.shadowRoot!.removeEventListener('mouseout', unhoverElement);
    current.shadowRoot!.removeEventListener('click', selectElement);

    setHoveredElement(null);
    setSelectedElement(null);
    setIsActive(false);
  }, []);

  return React.useMemo(() => ({
    isActive,
    hoveredElement,
    selectedElement,
    start,
    stop
  }), [isActive, hoveredElement, selectedElement]);
}


export type ReplaceRootBehavior = ReturnType<typeof useReplaceRootBehavior>;

export function useReplaceRootBehavior(embed: EmbeddedHTMLRef, selection: SelectionBehavior) {
  const [isActive, setIsActive] = React.useState(false);

  const start = React.useCallback(() => {
    const { current } = embed;
    if (!current) return;

    setIsActive(true);
    selection.start();
  }, []);

  const stop = React.useCallback(() => {
    setIsActive(false);
    selection.stop();
  }, []);

  React.useEffect(() => {
    if (selection.selectedElement && isActive) {
      const shadowRoot = embed.current!.shadowRoot!;
      const { selectedElement } = selection;
      const keepTags = ['TITLE', 'STYLE'];

      shadowRoot.appendChild(selectedElement);

      Array.from(shadowRoot.children)
        .filter(el => !(keepTags.includes(el.tagName) || el === selectedElement))
        .forEach(el => el.remove());

      stop();
    }
  }, [selection.selectedElement, isActive]);

  return React.useMemo(() => ({
    start,
    stop,
    isActive,
  }), [isActive]);
}


export type ContentEditableBehavior = ReturnType<typeof useContentEditableBehavior>;

export function useContentEditableBehavior(embed: EmbeddedHTMLRef) {
  const [isActive, setIsActive] = React.useState(false);
  
  const start = React.useCallback(() => {
    const shadowRoot = embed.current!.shadowRoot!;

    Array.from(shadowRoot.children)
      .forEach(el => el.setAttribute('contenteditable', 'true'));

    setIsActive(true);
  }, []);

  const stop = React.useCallback(() => {
    const shadowRoot = embed.current!.shadowRoot!;

    Array.from(shadowRoot.children)
      .forEach(el => el.removeAttribute('contenteditable'));

    setIsActive(false);
  }, []);

  return React.useMemo(() => ({
    isActive,
    start,
    stop
  }), [isActive]);
}


export type DeleteElementBehavior = ReturnType<typeof useDeleteElementBehavior>;

export function useDeleteElementBehavior(embed: EmbeddedHTMLRef, selection: SelectionBehavior) {
  const [isActive, setIsActive] = React.useState(false);

  const start = React.useCallback(() => {
    setIsActive(true);
    selection.start();
  }, []);


  const stop = React.useCallback(() => {
    setIsActive(false);
    selection.stop();
  }, []);


  React.useEffect(() => {
    if (isActive && selection.selectedElement) {
      selection.selectedElement.remove();
    }
  }, [selection.hoveredElement, isActive]);

  return {
    isActive,
    start,
    stop
  };
}