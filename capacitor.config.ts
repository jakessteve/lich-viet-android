import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lichviet.calendar',
  appName: 'Lịch Việt',
  webDir: 'dist',
  server: {
    hostname: 'app.lichviet.calendar',
    androidScheme: 'https',
  },
};

export default config;
