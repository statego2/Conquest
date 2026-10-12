import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir:'./',
  testMatch:'*.spec.mjs',
  fullyParallel:false,
  reporter:[['line'],['html',{open:'never',outputFolder:'e2e-report'}]],
  use:{
    baseURL:'http://127.0.0.1:5173',
    browserName:'chromium',
    viewport:{width:844,height:390},
    isMobile:true,hasTouch:true,deviceScaleFactor:2,
  },
  webServer:{
    command:'npm run dev -- --host 127.0.0.1 --port 5173',
    url:'http://127.0.0.1:5173/',
    timeout:60000,
    reuseExistingServer:!process.env.CI,
  },
});
