import React from 'react';
import { ResizeHandle, ResizeHandleProps } from '@/react-web/components';
import { useStoreState, useZoomPanHelper } from 'react-flow-renderer';


export const ScaledResizeHandle = React.forwardRef<HTMLDivElement, ResizeHandleProps>(function ScaledResizeHandle(props: ResizeHandleProps, ref) {
  const zoom = useStoreState(state => state.transform[2]);

  return (
    <ResizeHandle
      ref={ref}
      {...props}
      transform={`${props.transform ?? ''} scale(${1/zoom}, ${1/zoom})`}
    />
  );
});