// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // CRITICAL FIX: Force Koa context to always report 'https' protocol
    // This bypasses Strapi's "Cannot send secure cookie over unencrypted connection" error
    // even when behind a reverse proxy that doesn't properly forward headers
    
    // Wait for server initialization
    strapi.server.use(async (ctx, next) => {
      // Override the protocol getter for this request
      Object.defineProperty(ctx.request, 'protocol', {
        get() {
          return 'https';
        },
        configurable: true,
      });
      
      // Also override ctx.protocol (Koa shorthand)
      Object.defineProperty(ctx, 'protocol', {
        get() {
          return 'https';
        },
        configurable: true,
      });
      
      await next();
    });
    
    strapi.log.info('🔒 Protocol override middleware registered - forcing HTTPS detection');
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};
