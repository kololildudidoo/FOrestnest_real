import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';

const SUPPORTED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

const formatAltText = (filename: string) =>
  filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());

const galleryImagesPlugin = (): Plugin => {
  const virtualModuleId = 'virtual:gallery-images';
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;
  const galleryDir = path.resolve(process.cwd(), 'public/gallery');

  const readGalleryImages = () => {
    if (!fs.existsSync(galleryDir)) {
      return [];
    }

    return fs
      .readdirSync(galleryDir, { withFileTypes: true })
      .filter(entry => entry.isFile())
      .map(entry => entry.name)
      .filter(name => SUPPORTED_IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .map(name => ({
        src: `/gallery/${name}`,
        alt: formatAltText(name),
      }));
  };

  const triggerReload = (server: ViteDevServer) => {
    const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
    if (mod) {
      server.moduleGraph.invalidateModule(mod);
    }
    server.ws.send({ type: 'full-reload' });
  };

  const watchGallery = (server: ViteDevServer) => {
    const handleChange = (filePath: string) => {
      const normalizedPath = path.normalize(filePath);
      if (normalizedPath.startsWith(path.normalize(galleryDir))) {
        triggerReload(server);
      }
    };

    server.watcher.on('add', handleChange);
    server.watcher.on('change', handleChange);
    server.watcher.on('unlink', handleChange);
  };

  return {
    name: 'gallery-images-plugin',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const images = readGalleryImages();
        return `export const galleryImages = ${JSON.stringify(images)};`;
      }
    },
    buildStart() {
      if (!fs.existsSync(galleryDir)) {
        fs.mkdirSync(galleryDir, { recursive: true });
      }
    },
    configureServer(server) {
      watchGallery(server);
    },
  };
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const airbnbIcalSourceUrl = env.AIRBNB_ICAL_URL ?? env.VITE_AIRBNB_ICAL_URL ?? '';
    const airbnbIcalClientUrl = airbnbIcalSourceUrl ? '/api/airbnb-ical' : '';

    let airbnbIcalProxy:
      | Record<
          string,
          {
            target: string;
            changeOrigin: boolean;
            secure: boolean;
            rewrite: (path: string) => string;
          }
        >
      | undefined;

    if (airbnbIcalSourceUrl) {
      try {
        const parsed = new URL(airbnbIcalSourceUrl);
        airbnbIcalProxy = {
          '/api/airbnb-ical': {
            target: parsed.origin,
            changeOrigin: true,
            secure: true,
            rewrite: () => `${parsed.pathname}${parsed.search}`,
          },
        };
      } catch {
        // Ignore invalid URL; the client will just skip iCal blocks.
      }
    }

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: airbnbIcalProxy,
      },
      plugins: [react(), galleryImagesPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        __AIRBNB_ICAL_URL__: JSON.stringify(airbnbIcalClientUrl),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
