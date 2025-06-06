import { chatHandler } from './src/chat.js';
import { Matchmaker } from './src/matchmaker.js';

export { Matchmaker };

export default {
  /**
   * Cloudflare Worker entry point.
   *
   * Telegram delivers updates via POST requests. These are parsed and the
   * contained message is passed to {@link chatHandler} for further processing.
   * For any non-POST request a simple greeting is returned.
   */
  async fetch(request, env, ctx) {
    // Telegram sends updates via POST. Only handle those.
    if (request.method === 'POST') {
      const body = await request.json();
      // Delegate the heavy lifting to chatHandler.
      await chatHandler(body.message, env);
      return new Response("OK");
    }
    // Basic response for health checks or direct visits.
    return new Response("Hello from AnonLinkBot on Workers! 👋");
  }
}
