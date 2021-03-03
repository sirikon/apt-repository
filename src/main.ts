import { serve } from "https://deno.land/std@0.88.0/http/server.ts";
import routes from './routes.ts';

const s = serve({ port: 8000 });
console.log("Listening on http://localhost:8000/");

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
    try { await req.respond({ status: 500 }) }
    catch (err) { /**/ }
  }
}
