import { CONTENT } from './content';

const captchaGlob = import.meta.glob('../assets/photos/captcha/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const galleryGlob = import.meta.glob('../assets/photos/gallery/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const barengGlob = import.meta.glob('../assets/photos/bareng/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const kartuGlob = import.meta.glob('../assets/photos/kartu/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function sortKeys(keys: string[]): string[] {
  return keys.sort((a, b) => {
    const aBase = a.split('/').pop() ?? a;
    const bBase = b.split('/').pop() ?? b;
    return aBase.localeCompare(bBase, undefined, { numeric: true, sensitivity: 'base' });
  });
}

export const captchaPhotos: string[] = sortKeys(Object.keys(captchaGlob)).map((k) => captchaGlob[k]);

const galleryKeys = sortKeys(Object.keys(galleryGlob));
const replacedGalleryKey = galleryKeys[5] ?? null;
const replacementGalleryKey = galleryKeys.find((key) => key.endsWith('/image copy 6.png')) ?? null;

export const chatProfilePhoto: string | null = replacedGalleryKey
  ? galleryGlob[replacedGalleryKey]
  : null;

const displayedGalleryKeys = galleryKeys.filter(
  (key) => key !== replacedGalleryKey && key !== replacementGalleryKey,
);

if (replacementGalleryKey) {
  displayedGalleryKeys.splice(5, 0, replacementGalleryKey);
}

export const galleryPhotos: string[] = displayedGalleryKeys.map((key) => galleryGlob[key]);

export const togetherPhoto: string | null =
  sortKeys(Object.keys(barengGlob)).length > 0
    ? barengGlob[sortKeys(Object.keys(barengGlob))[0]]
    : null;

export const cardPhoto: string | null =
  sortKeys(Object.keys(kartuGlob)).length > 0
    ? kartuGlob[sortKeys(Object.keys(kartuGlob))[0]]
    : null;

export interface GalleryPhoto {
  src: string;
  caption: string;
}

export const galleryItems: GalleryPhoto[] = galleryPhotos.map((src, i) => ({
  src,
  caption: CONTENT.photoCaptions[i % CONTENT.photoCaptions.length],
}));
