export function formatTimer(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export function remainingTimerSeconds(endsAt, now = Date.now()) {
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}
