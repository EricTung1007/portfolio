/** Presentation-only OS badge and conservative WebGPU capability check. */
export type PlatformFlavor = 'windows' | 'macos' | 'ios' | 'android' | 'linux' | 'other';
export type BrowserModelTier = 'lite' | 'small' | 'enhanced';
export interface BrowserCapability {
  gpuAvailable: boolean;
  supportsF16: boolean;
  note: string;
}
export function getPlatformFlavor(): PlatformFlavor {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  // iPadOS can report MacIntel when using a touch-enabled device.
  if (/iPad|iPhone|iPod/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  if (/Win/i.test(platform) || /Windows/i.test(ua)) return 'windows';
  if (/Mac/i.test(platform) || /Macintosh/i.test(ua)) return 'macos';
  if (/Linux|X11/i.test(platform + ua)) return 'linux';
  return 'other';
}
export function getSystemBrand(): string {
  switch (getPlatformFlavor()) {
    case 'windows': return 'Eric.exe';
    case 'macos': return 'Eric.dmg';
    case 'ios': return 'Eric.ipa';
    case 'android': return 'Eric.apk';
    case 'linux': return 'Eric.AppImage';
    default: return 'Eric.exe';
  }
}
export async function inspectBrowserCapability(): Promise<BrowserCapability> {
  if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
    return { gpuAvailable: false, supportsF16: false, note: 'No WebGPU available in this browser.' };
  }
  try {
    // Browser adapters are capability checks, not trustworthy VRAM measurements.
    const gpu = (navigator as Navigator & { gpu: { requestAdapter: () => Promise<{ features: Set<string> } | null> } }).gpu;
    const adapter = await gpu.requestAdapter();
    if (!adapter) return { gpuAvailable: false, supportsF16: false, note: 'WebGPU adapter is unavailable.' };
    return { gpuAvailable: true, supportsF16: adapter.features.has('shader-f16'), note: 'WebGPU available; exact free GPU memory cannot be determined.' };
  } catch {
    return { gpuAvailable: false, supportsF16: false, note: 'WebGPU detection failed.' };
  }
}

/** WebLLM 0.2.86 prebuilt AppConfig; VRAM is estimated at a 4K context.
 * Loading is always opt-in. Larger options are never selected automatically.
 */
export const BROWSER_MODELS = {
  lite: {
    f16: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
    f32: 'SmolLM2-360M-Instruct-q4f32_1-MLC',
    approxVramMB: 376,
    label: 'SmolLM2 360M · legacy lightweight',
  },
  small: {
    f16: 'Qwen3.5-0.8B-q4f16_1-MLC',
    f32: 'Qwen3.5-0.8B-q4f32_1-MLC',
    approxVramMB: 1629,
    label: 'Qwen3.5 0.8B · recommended',
  },
  enhanced: {
    f16: 'Qwen3.5-2B-q4f16_1-MLC',
    f32: 'Qwen3.5-2B-q4f32_1-MLC',
    approxVramMB: 2245,
    label: 'Qwen3.5 2B · enhanced',
  },
} as const;

/** No silent upgrade or fallback. F16 is preferred; F32 works without shader-f16. */
export function chooseBrowserModel(tier: BrowserModelTier, capability: BrowserCapability): string | null {
  if (!capability.gpuAvailable) return null;
  return capability.supportsF16 ? BROWSER_MODELS[tier].f16 : BROWSER_MODELS[tier].f32;
}
