import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ColorWallpaper',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic'
  },
  plugins: {
    StatusBar: {
      style: 'dark'
    }
  }
};

export default config;
