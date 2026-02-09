// src/bugsnag.js
// Bugsnag initialization and Express middleware setup.

import Bugsnag from '@bugsnag/js';
import BugsnagPluginExpress from '@bugsnag/plugin-express';

const apiKey = process.env.BUGSNAG_API_KEY;

// We keep these exports to be used in app.js
let bugsnagClient = null;
let bugsnagMiddleware = null;

if (apiKey && apiKey.trim() !== '') {
  Bugsnag.start({
    apiKey,
    plugins: [BugsnagPluginExpress],
    appType: 'server',
    appVersion: '1.0.0',
    releaseStage: process.env.NODE_ENV || 'development',
    enabledReleaseStages: ['development', 'staging', 'production'],
  });

  bugsnagClient = Bugsnag;
  bugsnagMiddleware = Bugsnag.getPlugin('express');

  console.log('[Bugsnag] Initialized successfully');
} else {
  console.warn('[Bugsnag] BUGSNAG_API_KEY is not set. Bugsnag monitoring is disabled.');
}

export { bugsnagClient, bugsnagMiddleware };
