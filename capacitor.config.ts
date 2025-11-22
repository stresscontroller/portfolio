import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'app.cruisecode.dtd',
    appName: 'DTD',
    webDir: 'dist',
    server: {
        // TODO: this needs to be updated on the server to prevent CORS
        androidScheme: 'http',
        hostname: 'localhost:4200',
    },
};

export default config;
