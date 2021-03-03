import { ServerRequest } from "https://deno.land/std@0.88.0/http/server.ts";
import { ensureDir } from "https://deno.land/std@0.89.0/fs/mod.ts";
import { replyBadRequest, replyOK, replyTemplate } from "./web/reply.ts";

export default [
  {url: /^\/$/, handler: async (req: ServerRequest) => {
    await replyTemplate(req, 'index.ejs', {})
  }},
  {url: /^\/upload$/, handler: async (req: ServerRequest) => {
    await ensureDir('./data/packages');
    const file = await Deno.open(`./data/packages/cosa.deb`, { create: true, write: true });
    await Deno.copy(req.body, file);
    file.close();
    await replyOK(req);
  }}
]
