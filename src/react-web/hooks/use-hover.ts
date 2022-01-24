import React from 'react';


export type UseHoverOptions<T extends HTMLElement> = {
  hoverElementRef?: React.RefObject<T>,
  in?: () => void,
  out?: () => void,
}

export function useHover<T extends HTMLElement = HTMLElement>(options?: UseHoverOptions<T>, deps?: any[]) {
  const hoverElementRef = React.useMemo(() => options?.hoverElementRef ?? React.createRef<T>(), [options?.hoverElementRef]);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
    options?.in?.();
  }, [setIsHovered]);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
    options?.out?.();
  }, [setIsHovered]);

  React.useLayoutEffect(() => {
    hoverElementRef.current?.addEventListener('mouseenter', handleMouseEnter);
    hoverElementRef.current?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      hoverElementRef.current?.removeEventListener('mouseenter', handleMouseEnter);
      hoverElementRef.current?.removeEventListener('mouseleave', handleMouseLeave)
    };
  }, [hoverElementRef.current, ...(deps ?? [])]);

  return {
    isHovered,
    hoverElementRef
  };
}