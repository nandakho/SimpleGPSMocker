import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'id.my.nandakho.sgm',
  appName: 'SimpleGPSMocker',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
