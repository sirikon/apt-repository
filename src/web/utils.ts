import { ServerRequest } from "std/http/server.ts";
import { join, normalize } from "std/path/mod.ts"
import { exists } from "std/fs/mod.ts";
import { replyFile, replyGzipedFile, replyNotFound } from "@/web/reply.ts";

export function route(url: RegExp, handler: (req: ServerRequest) => Promise<void>) {
  return { url, handler }
}

export function serve(basePath: string, staticFolder: string) {
  const normalizedStaticFolder = normalize(staticFolder);

  return route(new RegExp(`^${basePath}`), async (req) => {
    const subpath = req.url.substr(basePath.length);
    const staticFile = normalize(join(normalizedStaticFolder, subpath));
    if (!staticFile.startsWith(normalizedStaticFolder)) return await replyNotFound(req);

    const gzAlt = `${staticFile}.gz`;
    if (clientAcceptsGzip(req) && await exists(gzAlt)) {
      await replyGzipedFile(req, gzAlt);
      return;
    }

    if (!await exists(staticFile)) return await replyNotFound(req);
    await replyFile(req, staticFile);
  });
}

export function serveFile(path: string, staticPath: string, contentType?: string) {
  const filePath = normalize(staticPath);
  return route(new RegExp(`^${path}$`), async (req) => {
    if (!await exists(filePath)) return await replyNotFound(req);
    await replyFile(req, filePath, contentType);
  });
}

function clientAcceptsGzip(req: ServerRequest): boolean {
  const headerValue = req.headers.get('accept-encoding');
  if (headerValue == null) return false;
  const acceptedEncodings = headerValue
    .split(',')
    .map(i => i.trim());
  return acceptedEncodings.indexOf('gzip') >= 0;
}
