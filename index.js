import app from './lib/app';

app().listen(process.env.AUTHENTICATION_APP_PORT || 7000);
