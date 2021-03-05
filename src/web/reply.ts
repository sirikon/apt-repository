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

export async function replyFile(req: ServerRequest, filePath: string, contentType?: string) {
  const file = await Deno.open(filePath, { read: true });
  const fileInfo = await Deno.lstat(filePath);
  await req.respond({ headers: new Headers([
    ['content-type', contentType || 'application/octet-stream'],
    ['content-length', fileInfo.size.toString()],
  ]), body: file });
  file.close();
}

// deno-lint-ignore no-explicit-any
export async function replyTemplate(req: ServerRequest, templatePath: string, context: { [key: string]: any }) {
  const result = await dejs.renderFile(`./src/templates/${templatePath}`, context)
  await replyHTML(req, result);
}
