import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lichviet.calendar',
  appName: 'Lịch Việt',
  webDir: '../lich-viet/dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      fadeOutDuration: 300,
    },
  },
};

export default config;