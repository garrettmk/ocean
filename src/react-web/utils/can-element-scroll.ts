export function canElementScroll(element?: HTMLElement) : boolean {
  if (!element)
    return false;

  const { clientHeight, clientWidth, scrollHeight, scrollWidth } = element;
  return (scrollHeight > clientHeight) || (scrollWidth > clientWidth);
}