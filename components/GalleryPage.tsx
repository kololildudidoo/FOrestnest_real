import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { galleryImages as localGalleryImages } from 'virtual:gallery-images';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Navbar from './Navbar';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { getDb, isFirebaseEnabled } from '../services/firebase';

type GalleryImage = {
  src: string;
  title: string;
  subtitle: string;
};

const GALLERY_CAPTIONS: Record<string, { title: string; subtitle: string }> = {
  '/gallery/JPA02140_1_2_3_4_Enhancer-min.jpg': {
    title: 'Living room',
    subtitle: 'Cozy timber lounge with sofa bed and warm evening lighting.',
  },
  '/gallery/JPA02160_1_2_3_4_Enhancer-min.jpg': {
    title: 'Kitchen',
    subtitle: 'Fully equipped wooden kitchen with oven and full-size fridge.',
  },
  '/gallery/JPA02165_6_7_8_9_Enhancer-min.jpg': {
    title: 'Kitchen corner',
    subtitle: 'Extra prep space with microwave and storage for longer stays.',
  },
  '/gallery/JPA02175_6_7_8_9_Enhancer-min.jpg': {
    title: 'Dining area',
    subtitle: 'Dining table for meals and board games by the cabin windows.',
  },
  '/gallery/JPA02180_1_2_3_4_Enhancer-min.jpg': {
    title: 'Living room',
    subtitle: 'Relaxing corner with TV and soft lighting after a day outside.',
  },
  '/gallery/JPA02190_1_2_3_4_Detailed-min.jpg': {
    title: 'Bathroom',
    subtitle: 'Bright bathroom with a large sink and a washing machine.',
  },
  '/gallery/JPA02195_6_7_8_9_Enhancer-min.jpg': {
    title: 'Hallway',
    subtitle: 'Entrance hallway connecting the sauna and main living spaces.',
  },
  '/gallery/JPA02205_6_7_8_9_Enhancer-min.jpg': {
    title: 'Sauna access',
    subtitle: 'A short corridor leading into the sauna area.',
  },
  '/gallery/JPA02210_1_2_3_4_Optimizer-min.jpg': {
    title: 'Sauna',
    subtitle: 'Traditional Finnish sauna with wooden benches and warm ambience.',
  },
  '/gallery/JPA02230_1_2_3_4_Enhancer-min.jpg': {
    title: 'Entrance',
    subtitle: 'Entryway with stairs up to the loft.',
  },
  '/gallery/JPA02240_1_2_3_4_Enhancer-min.jpg': {
    title: 'Storage nook',
    subtitle: 'Convenient space for boots, coats, and outdoor gear.',
  },
  '/gallery/JPA02245_6_7_8_9_Enhancer-min.jpg': {
    title: 'Loft lounge',
    subtitle: 'Open upstairs lounge for relaxing, reading, or extra sleeping.',
  },
  '/gallery/JPA02250_1_2_3_4_Balanced-min.jpg': {
    title: 'Twin bedroom',
    subtitle: 'Bedroom with two single beds and warm wood-panel walls.',
  },
  '/gallery/JPA02275_6_7_8_9_Balanced-min.jpg': {
    title: 'Main bedroom',
    subtitle: 'Spacious bedroom with a double bed and bedside lighting.',
  },
  '/gallery/JPA02285_6_7_8_9_Optimizer-min.jpg': {
    title: 'Extra room',
    subtitle: 'Flexible space with a travel cot and hanging storage.',
  },
};

interface GalleryPageProps {
  onNavigate: (page: string) => void;
  onStartBooking: () => void;
}

const GalleryPage: React.FC<GalleryPageProps> = ({ onNavigate, onStartBooking }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [remoteImages, setRemoteImages] = useState<GalleryImage[]>([]);

  const defaultImages: GalleryImage[] = [
    { src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1000", title: "Living Room", subtitle: "" },
    { src: "https://images.unsplash.com/photo-1616594039964-408359566a05?q=80&w=800", title: "Master Bedroom", subtitle: "" },
    { src: "https://images.unsplash.com/photo-1556912173-3db996ea1247?q=80&w=800", title: "Kitchen", subtitle: "" },
    { src: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1000", title: "Forest Exterior", subtitle: "" },
    { src: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800", title: "Sauna", subtitle: "" },
    { src: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=800", title: "Bathroom", subtitle: "" },
    { src: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=800", title: "Fireplace", subtitle: "" },
    { src: "https://images.unsplash.com/photo-1504643039591-52948e3ddb47?q=80&w=800", title: "Details", subtitle: "" },
    { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200", title: "Patio", subtitle: "" },
  ];

  const localImages: GalleryImage[] = localGalleryImages.map((image) => {
    const caption = GALLERY_CAPTIONS[image.src];
    return {
      src: image.src,
      title: caption?.title ?? image.alt,
      subtitle: caption?.subtitle ?? '',
    };
  });

  const images = remoteImages.length ? remoteImages : (localImages.length ? localImages : defaultImages);

  const closeLightbox = () => setActiveIndex(null);

  const showPrevious = () => {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex - 1 + images.length) % images.length);
  };

  const showNext = () => {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex + 1) % images.length);
  };

  useEffect(() => {
    if (!isFirebaseEnabled()) {
      return;
    }

    const db = getDb();
    if (!db) {
      return;
    }

    const galleryQuery = query(collection(db, 'gallery'), orderBy('order', 'asc'));
    return onSnapshot(galleryQuery, (snapshot) => {
      const nextImages = snapshot.docs
        .map((doc) => {
          const data = doc.data() as Partial<GalleryImage>;
          const src = data.src?.toString().trim();
          if (!src) return null;
          return {
            src,
            title: data.title?.toString().trim() || 'Gallery image',
            subtitle: data.subtitle?.toString().trim() || '',
          } as GalleryImage;
        })
        .filter((image): image is GalleryImage => Boolean(image));

      if (nextImages.length) {
        setRemoteImages(nextImages);
      }
    });
  }, []);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
        return;
      }
      if (event.key === 'ArrowLeft') {
        showPrevious();
        return;
      }
      if (event.key === 'ArrowRight') {
        showNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex, images.length]);

  useEffect(() => {
    if (activeIndex !== null && activeIndex >= images.length) {
      setActiveIndex(null);
    }
  }, [activeIndex, images.length]);

  const lightbox =
    activeIndex !== null && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            onClick={closeLightbox}
          >
            <div
              className="relative w-[92vw] sm:w-[90vw] max-w-6xl h-[92vh] sm:h-[90vh] max-h-[56rem]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeLightbox}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/95 hover:bg-white text-gray-900 w-11 h-11 rounded-full shadow-xl flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd166]/40"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl grid grid-rows-[minmax(0,1fr)_auto] h-full">
                <div className="relative bg-black flex items-center justify-center">
                  <img
                    src={images[activeIndex].src}
                    alt={images[activeIndex].title}
                    className="w-full h-full object-contain"
                  />

                  <button
                    type="button"
                    onClick={showPrevious}
                    className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 w-11 h-11 rounded-full shadow-xl items-center justify-center transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd166]/40"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <button
                    type="button"
                    onClick={showNext}
                    className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 w-11 h-11 rounded-full shadow-xl items-center justify-center transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ffd166]/40"
                    aria-label="Next image"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg sm:text-xl font-semibold text-gray-900">
                        {images[activeIndex].title}
                      </div>
                      {images[activeIndex].subtitle ? (
                        <div className="text-gray-500 mt-1">{images[activeIndex].subtitle}</div>
                      ) : null}
                    </div>

                    <div className="sm:hidden flex items-center gap-2">
                      <button
                        type="button"
                        onClick={showPrevious}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={showNext}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 mt-4">
                    {activeIndex + 1} / {images.length} • Press Esc to close, ←/→ to navigate
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="min-h-screen bg-white animate-fade-in">
       <Navbar onNavigate={onNavigate} onStartBooking={onStartBooking} variant="solid" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
          {images.map((img, idx) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Open image: ${images[idx].title}`}
              className="mb-4 break-inside-avoid w-full text-left"
            >
              <div className="relative rounded-3xl overflow-hidden group cursor-pointer bg-gray-100">
                <img
                  src={img.src}
                  alt={images[idx].title}
                  className="w-full h-auto block object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow">
                  <div className="font-semibold">{images[idx].title}</div>
                  {images[idx].subtitle ? (
                    <div className="text-sm text-white/90 mt-0.5">{images[idx].subtitle}</div>
                  ) : null}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {lightbox}
    </div>
  );
};

export default GalleryPage;
