// /utils/emotion-cache.ts
import createCache from '@emotion/cache';



// Crea un caché compatible con SSR
export const createEmotionCache = () =>
  createCache({ key: 'css', prepend: true });
