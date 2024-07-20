const webpack = require('webpack');

/** @type {import('next').NextConfig} */

const nextConfig = {
   images: {
      remotePatterns: [
         {
            hostname: 'placekitten.com',
         },
         {
            hostname: 'agenda-ahora-production.s3.us-east-1.amazonaws.com',
         },
         {
            hostname: 'agenda-ahora-production.s3.amazonaws.com',
         },
      ],
   },
   typescript: {
      ignoreBuildErrors: true,
   },
   webpack: (config, { isServer, nextRuntime }) => {
      if (isServer && nextRuntime === 'nodejs')
         config.plugins.push(
            new webpack.IgnorePlugin({ resourceRegExp: /^aws-crt$/ }),
         );
      return config;
   },
   async headers() {
      return [
         {
            source: '/:path*',
            headers: [
               {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
               },
               {
                  key: 'Content-Security-Policy',
                  value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
               },
               {
                  key: 'X-Content-Type-Options',
                  value: 'nosniff',
               },
               {
                  key: 'Referrer-Policy',
                  value: 'origin-when-cross-origin',
               },
            ],
         },
      ];
   },
};

const dns = 'dev.api.agendaahora.com dev.front.agendaahora.com';

const ContentSecurityPolicy = `
   img-src 'self' blob: data: ${dns} www.paypalobjects.com;
   script-src 'self' blob: 'unsafe-inline' 'unsafe-eval';
   script-src-elem 'self' 'unsafe-inline' www.paypal.com;
   style-src 'self' 'unsafe-inline';
   font-src 'self' data:;
   object-src 'self' data:;
   frame-src 'self' www.sandbox.paypal.com;
   frame-ancestors 'self' www.sandbox.paypal.com;
   form-action 'self';
   connect-src 'self' ${dns} currency-converter5.p.rapidapi.com www.sandbox.paypal.com cognito-idp.us-east-1.amazonaws.com cognito-identity.us-east-1.amazonaws.com agenda-ahora-production.s3.us-east-1.amazonaws.com localhost:*;
   default-src 'self';
`;

module.exports = nextConfig;
