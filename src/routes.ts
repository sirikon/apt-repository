import { ServerRequest } from "https://deno.land/std@0.88.0/http/server.ts";
import { replyTemplate } from "./web/reply.ts";

export default [
  {url: /^\/$/, handler: (req: ServerRequest) => {
    replyTemplate(req, 'index.ejs', {})
  }}
]
