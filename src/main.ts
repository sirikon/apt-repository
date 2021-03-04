import { serve } from "https://deno.land/std@0.88.0/http/server.ts";
import routes from './routes.ts';
import config from './config.ts';

const s = serve({ hostname: '0.0.0.0', port: config.port });
console.log(`Listening on http://localhost:${config.port}/`);

for await (const req of s) {
  try {
    let matched = false;
    for (const route of routes) {
      if (req.url.match(route.url)) {
        await route.handler(req);
        matched = true;
        break;
      }
    }
    if (!matched) {
      await req.respond({ status: 404 })
    }
  } catch (err) {
    console.error(err);
    try { await req.respond({ status: 500 }) }
    catch (err) { /**/ }
  }
}
