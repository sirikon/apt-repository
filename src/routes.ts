import { ServerRequest } from "std/http/server.ts";
import { ensureDir } from "std/fs/mod.ts";
import { join, normalize } from "std/path/mod.ts"
import { replyBadRequest, replyOK, replyTemplate } from "@/web/reply.ts";
import { route, serve, serveFile } from "@/web/utils.ts";
import { getPackages, savePackage } from "@/services/packageStore.ts";
import { isValidDeb } from "@/services/deb.ts";
import config from '@/config.ts';

export default [
  route(/^\/$/, async (req) => {
    await replyTemplate(req, 'index.ejs', {
      packages: await getPackages()
    });
  }),

  serve('/assets', './src/web/assets'),

  serve('/packages', data('packages')),
  serveFile('/Packages', data('Packages'), 'text/plain'),
  serveFile('/Packages.gz', data('Packages.gz')),

  route(/^\/upload$/, async (req: ServerRequest) => {
    if (req.headers.get('secret') !== config.uploadSecret) return await replyBadRequest(req);

    await ensureDir(data('temp/uploads'));
    const tempFilePath = data(`temp/uploads/${randomTempFileName()}.deb`);

    const file = await Deno.open(tempFilePath, { create: true, write: true });
    await Deno.copy(req.body, file);
    file.close();

    if (!await isValidDeb(tempFilePath)) {
      await Deno.remove(tempFilePath);
      return await replyBadRequest(req);
    }

    await savePackage(tempFilePath);
    await replyOK(req);
  })
]

function randomTempFileName() {
  const validChars = 'abcdefghiklmnopqrstuvwxyz0123456789';
  const length = 16;
  const result = [];
  for(let i = 0; i < length; i++) {
    const position = Math.floor(Math.random() * validChars.length);
    result.push(validChars[position]);
  }
  return result.join('');
}

function data(path: string) {
  return normalize(join(config.dataFolder, path));
}
