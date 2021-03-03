import { ServerRequest } from "https://deno.land/std@0.88.0/http/server.ts";
import * as dejs from "https://deno.land/x/dejs@0.9.3/mod.ts";

export async function replyHTML(req: ServerRequest, content: string | Uint8Array | Deno.Reader) {
  await req.respond({ headers: new Headers([
    ['content-type', 'text/html']
  ]), body: content })
}

export async function replyTemplate(req: ServerRequest, templatePath: string, context: { [key: string]: any }) {
  const result = await dejs.renderFile(`./src/templates/${templatePath}`, context)
  await replyHTML(req, result);
}
