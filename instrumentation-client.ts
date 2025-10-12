import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  integrations: [
  //  Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  tunnel: "/api/sentryTunnel",
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;