require('dotenv').config();
const express = require('express');
const Bugsnag = require('@bugsnag/js');
const BugsnagPluginExpress = require('@bugsnag/plugin-express');

Bugsnag.start({
    apiKey: process.env.BUGSNAG_API_KEY,
    plugins: [BugsnagPluginExpress]
});

const bugsnagMiddleware = Bugsnag.getPlugin('express');

const app = express();

app.use(bugsnagMiddleware.requestHandler);

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/bugsnag-test', (req, res, next) => {
    const err = new Error('Test error from /bugsnag-test');
    next(err);
});

app.use(bugsnagMiddleware.errorHandler);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
