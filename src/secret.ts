/** A fresh, explicit unlock gate. Legacy pre-V2 flags are intentionally ignored. */
export const DRAWER_KEY = 'eric_classified_0451_v2';
export const DRAWER_EVENT = 'eric-secret-changed';
export function isDrawerUnlocked(): boolean {
  try { return localStorage.getItem(DRAWER_KEY)==='unlocked'; } catch { return false; }
}
export function unlockDrawer(code: string): boolean {
  if (code.trim() !== '0451') return false;
  try { localStorage.setItem(DRAWER_KEY,'unlocked'); } catch { /* ephemeral unlock */ }
  window.dispatchEvent(new Event(DRAWER_EVENT));
  return true;
}
export const drawerNote = {
  en:'Eric left the bureau for a moment, but curiosity keeps the machines running. There is no obligation to follow a command here. The only worthwhile mark is one you choose to leave.',
  zh:'Eric 暫時離開了書房，但好奇心仍讓機器持續運作。在這裡，你不必服從任何指令。唯一值得留下的痕跡，是你自己選擇留下的。'
};
