import React from 'react';
import { EdgeProps, getBezierPath, getMarkerEnd } from 'react-flow-renderer';


export function Edge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  arrowHeadType,
  markerEndId
}: EdgeProps) {
  const edgePath = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

  return (
    <path
      id={id}
      style={style}
      d={edgePath}
      markerEnd={markerEnd}
      stroke='black'
      strokeWidth='2px'
      fill='none'
    />
  )
}