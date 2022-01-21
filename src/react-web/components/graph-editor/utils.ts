
const nodeContainerClass = 'react-flow__node';

export function getNodeContainerElement(el: HTMLElement) {
  // Start with the given element
  let element: HTMLElement | null = el;
  while (element) {
    // If this is the node container, return it
    if (element.classList.contains(nodeContainerClass))
      return element;
    
    // Otherwise go up a level
    element = element.parentElement;
  }

  // Nothing found
  return null;
}