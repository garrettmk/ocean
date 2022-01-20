import React from 'react';
import { useZoomPanHelper } from 'react-flow-renderer';

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button#value
enum MouseButtons {
  Left = 0,
  Middle = 1,
  Right = 2,
}

export type UseNodeResizingOptions = {
  start?: (rect: DOMRect) => void,
  stop?: (rect: DOMRect) => void
}

//
// Usage:
// const [resizeHandleRef, resizeElementRef] = useNodeResizing();
// ...
//<div ref={resizeElementRef}>
//  <div ref={resizeHandleRef}/>
//</div>
//
export function useNodeResizing(options?: UseNodeResizingOptions) {
  const { project } = useZoomPanHelper();
  const resizeHandle = React.useRef<HTMLDivElement | null>(null);
  const resizeElement = React.useRef<HTMLDivElement | null>(null);

  // Respond to mousemove events by changing the size of resizeElement
  const resizeCallback = React.useCallback((event: MouseEvent) => {
    // Get the bounding rect of the element to resize
    const elementRect = resizeElement.current!.getBoundingClientRect();

    // Translate both the element and mouse positions into react-flow's coordinate space
    const { x: mouseX, y: mouseY } = project({ x: event.pageX, y: event.pageY });
    const { x: elementX, y: elementY } = project({ x: elementRect.x, y: elementRect.y });

    // Calculate the new width
    const newWidth = mouseX - elementX;
    const newHeight = mouseY - elementY;

    // Set the element styles directly to avoid firing lots of re-renders
    resizeElement.current!.style.width = `${newWidth}px`;
    resizeElement.current!.style.height = `${newHeight}px`;
  }, []);

  // Remove the mouse event listener
  const stopResizing = React.useCallback(() => {
    // Notify the callback
    if (options?.stop) {
      const elementRect = resizeElement.current!.getBoundingClientRect();
      options.stop(elementRect);
    }

    window.removeEventListener('mousemove', resizeCallback);
    window.removeEventListener('mouseup', stopResizing);
  }, [resizeCallback]);

  // While resizing, listen to mouse events on the window
  // If mouseup, stop resizing
  const startResizing = React.useCallback((event: MouseEvent) => {
    if (resizeElement.current && event.button === MouseButtons.Left) {
      // Notify the callback
      if (options?.start) {
        const elementRect = resizeElement.current!.getBoundingClientRect();
        options.start(elementRect);
      }

      window.addEventListener('mousemove', resizeCallback);
      window.addEventListener('mouseup', stopResizing);
    }
  }, [resizeCallback]);

  // Listen for mousedown events on resizeHandle
  React.useLayoutEffect(() => {
    if (resizeHandle.current)
      resizeHandle.current.addEventListener('mousedown', startResizing);
    
    return () => {
      resizeHandle.current?.removeEventListener('mousedown', startResizing);
    }
  }, [resizeHandle.current]);

  return [resizeHandle, resizeElement];
}