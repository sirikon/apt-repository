import { ServerRequest, Response } from "std/http/server.ts";
import { lookup } from "media_types/mod.ts";
import * as dejs from "dejs/mod.ts";

export async function replyOK(req: ServerRequest) {
  await respond(req, { status: 200 });
}

export async function replyBadRequest(req: ServerRequest) {
  await respond(req, { status: 400 });
}

export async function replyNotFound(req: ServerRequest) {
  await respond(req, { status: 404 });
}

export async function replyHTML(req: ServerRequest, content: string | Uint8Array | Deno.Reader) {
  await respond(req, { headers: new Headers([
    ['content-type', 'text/html']
  ]), body: content })
}

export async function replyFile(req: ServerRequest, filePath: string, contentType?: string) {
  const file = await Deno.open(filePath, { read: true });
  const fileInfo = await Deno.lstat(filePath);
  await respond(req, { headers: new Headers([
    ['content-type', contentType || lookup(filePath) || 'application/octet-stream'],
    ['content-length', fileInfo.size.toString()],
  ]), body: file });
  file.close();
}

export async function replyGzipedFile(req: ServerRequest, filePath: string, contentType?: string) {
  const baseFilePath = filePath.replace(/\.gz$/, '');
  const file = await Deno.open(filePath, { read: true });
  const fileInfo = await Deno.lstat(filePath);
  await respond(req, { headers: new Headers([
    ['content-type', contentType || lookup(baseFilePath) || 'application/octet-stream'],
    ['content-encoding', 'gzip'],
    ['content-length', fileInfo.size.toString()],
  ]), body: file });
  file.close();
}

// deno-lint-ignore no-explicit-any
export async function replyTemplate(req: ServerRequest, templatePath: string, context: { [key: string]: any }) {
  const result = await dejs.renderFile(`./src/web/templates/${templatePath}`, context)
  await replyHTML(req, result);
}

async function respond(req: ServerRequest, response: Response) {
  await handleBrokenPipe(req.respond(response));
}

async function handleBrokenPipe(promise: Promise<void>) {
  try {
    await promise;
  } catch (err) {
    if (err.name !== 'BrokenPipe') throw err;
  }
}
