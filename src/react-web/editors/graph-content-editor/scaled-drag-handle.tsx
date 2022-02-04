import React from 'react';
import { DragHandle, DragHandleProps } from '@/react-web/components';
import { useStoreState, useZoomPanHelper } from 'react-flow-renderer';


export const ScaledDragHandle = React.forwardRef<HTMLDivElement, DragHandleProps>(function ScaledDragHandle(props: DragHandleProps, ref) {
  const zoom = useStoreState(state => state.transform[2]);

  return (
    <DragHandle
      ref={ref}
      {...props}
      transform={`${props.transform ?? ''} scale(${1/zoom}, ${1/zoom})`}
    />
  );
});