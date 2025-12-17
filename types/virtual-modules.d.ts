declare module 'virtual:gallery-images' {
  export interface GalleryImage {
    src: string;
    alt: string;
  }

  export const galleryImages: GalleryImage[];
}
