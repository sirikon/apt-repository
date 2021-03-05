import { ServerRequest } from "std/http/server.ts";
import * as dejs from "dejs/mod.ts";

export async function replyOK(req: ServerRequest) {
  await req.respond({ status: 200 });
}

export async function replyBadRequest(req: ServerRequest) {
  await req.respond({ status: 400 });
}

export async function replyHTML(req: ServerRequest, content: string | Uint8Array | Deno.Reader) {
  await req.respond({ headers: new Headers([
    ['content-type', 'text/html']
  ]), body: content })
}

// deno-lint-ignore no-explicit-any
export async function replyTemplate(req: ServerRequest, templatePath: string, context: { [key: string]: any }) {
  const result = await dejs.renderFile(`./src/templates/${templatePath}`, context)
  await replyHTML(req, result);
}
