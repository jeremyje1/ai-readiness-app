import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./test/setup.ts'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
            '@/lib': path.resolve(__dirname, './lib'),
            '@/components': path.resolve(__dirname, './components'),
            '@/app': path.resolve(__dirname, './app'),
            '@/hooks': path.resolve(__dirname, './hooks'),
            '@/utils': path.resolve(__dirname, './utils'),
            '@/types': path.resolve(__dirname, './types'),
        },
    },
});