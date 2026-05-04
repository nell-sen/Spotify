import { useEffect, useState } from 'react';

const cache = new Map<string, string>();

const sampleColor = (img: HTMLImageElement): string => {
  try {
    const canvas = document.createElement('canvas');
    const size = 32;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '270 50% 20%';
    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha < 128) continue;
      // skip near-black and near-white
      const rr = data[i], gg = data[i + 1], bb = data[i + 2];
      const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
      if (max < 25 || min > 235) continue;
      r += rr; g += gg; b += bb; count++;
    }
    if (!count) return '270 50% 20%';
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);
    return rgbToHsl(r, g, b);
  } catch {
    return '270 50% 20%';
  }
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  // boost saturation a bit
  s = Math.min(1, s * 1.3);
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(Math.min(45, l * 100))}%`;
};

export const useDominantColor = (src?: string | null) => {
  const [hsl, setHsl] = useState<string>('270 50% 20%');

  useEffect(() => {
    if (!src) return;
    if (cache.has(src)) { setHsl(cache.get(src)!); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = sampleColor(img);
      cache.set(src, c);
      setHsl(c);
    };
    img.onerror = () => {};
    img.src = src;
  }, [src]);

  return hsl;
};
