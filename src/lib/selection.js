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
