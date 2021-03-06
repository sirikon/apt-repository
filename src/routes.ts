import { ServerRequest } from "std/http/server.ts";
import { ensureDir, move, walk } from "std/fs/mod.ts";
import { replyBadRequest, replyFile, replyOK, replyTemplate } from "@/web/reply.ts";
import config from '@/config.ts';

export default [
  route(/^\/$/, async (req) => {
    const packages = [];
    for await (const entry of walk(data('packages'), { includeDirs: false, maxDepth: 1 })) {
      packages.push(entry.name);
    }
    await replyTemplate(req, 'index.ejs', { packages })
  }),

  route(/^\/packages/, async (req) => {
    const packageName = req.url.substr('/packages'.length).replace(/[\/\\]/g, '');
    const packagePath = data(`packages/${packageName}`);
    await replyFile(req, packagePath);
  }),

  route(/^\/Packages$/, async (req: ServerRequest) =>
    await replyFile(req, data('Packages'), 'text/plain')),

  route(/^\/Packages.gz$/, async (req: ServerRequest) =>
    await replyFile(req, data('/Packages.gz'), 'application/octet-stream')),

  route(/^\/upload$/, async (req: ServerRequest) => {
    if (req.headers.get('secret') !== config.uploadSecret) return await replyBadRequest(req);

    await ensureDir(data('temp/uploads'));
    const tempFilePath = data('temp/uploads/package.deb');

    const file = await Deno.open(tempFilePath, { create: true, write: true });
    await Deno.copy(req.body, file);
    file.close();

    const p = Deno.run({
      cmd: ["dpkg", "-I", tempFilePath],
      stdin: "null",
      stderr: "null",
      stdout: "piped",
    });
    const [status, stdout] = await Promise.all([
      p.status(),
      p.output()
    ]);
    p.close();
    if (!status.success) return await replyBadRequest(req);

    const debInfo = parseDebInfo(new TextDecoder().decode(stdout));
    await ensureDir(data('packages'));
    await move(tempFilePath, data(`packages/${debInfo['Package']}_${debInfo['Version']}.deb`), { overwrite: true });
    await Deno.run({
      cmd: ["bash", "-c", "apt-ftparchive packages packages > Packages && gzip -k -f Packages"],
      cwd: data(''), stdin: "null", stderr: "null", stdout: "null",
    }).status();

    await replyOK(req);
  })
]

function route(url: RegExp, handler: (req: ServerRequest) => Promise<void>) {
  return { url, handler }
}

function data(path: string) {
  return `${config.dataFolder}/${path}`
}

function parseDebInfo(data: string) {
  const info = data.split('\n')
    .splice(3)
    .map(line => line.substr(1))
    .filter(line => line !== '');

  const result: { [key: string]: string } = {};
  let lastKey: string | null = null;
  info.forEach(line => {
    if (line.match(/^[a-zA-Z]+:/)) {
      const [key, val] = line.split(': ');
      result[key] = val;
      lastKey = key;
    }
    if (line[0] === ' ' && lastKey) {
      result[lastKey] += line;
    }
  });
  return result;
}
