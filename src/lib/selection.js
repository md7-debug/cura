export function clipSelectionRects(lineRects, bounds) {
  return [...lineRects].flatMap((lineRect) => {
    const left = Math.max(bounds.left, lineRect.left);
    const right = Math.min(bounds.right, lineRect.right);
    if (right <= left || lineRect.height <= 0) return [];
    return [{
      height: lineRect.height * 0.66,
      left,
      top: lineRect.top + lineRect.height * 0.3,
      width: right - left,
    }];
  });
}

export function positionSelectionActions(rangeRect, paragraphRect, viewportWidth) {
  const nearOpening = rangeRect.top - paragraphRect.top < rangeRect.height * 2.4;
  return {
    left: Math.min(viewportWidth - 96, Math.max(96, rangeRect.left + rangeRect.width / 2)),
    top: Math.max(16, nearOpening ? paragraphRect.top - 54 : rangeRect.top - 56),
  };
}
