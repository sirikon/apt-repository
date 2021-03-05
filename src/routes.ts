import { ServerRequest } from "std/http/server.ts";
import { ensureDir, move, walk } from "std/fs/mod.ts";
import { replyBadRequest, replyOK, replyTemplate } from "@/web/reply.ts";
import config from '@/config.ts';

export default [
  {url: /^\/$/, handler: async (req: ServerRequest) => {
    const packages = [];
    for await (const entry of walk(`${config.dataFolder}/packages`, { includeDirs: false, maxDepth: 1 })) {
      packages.push(entry.name);
    }
    await replyTemplate(req, 'index.ejs', { packages })
  }},

  {url: /^\/packages/, handler: async (req: ServerRequest) => {
    const packageName = req.url.substr('/packages'.length);
    const packageFile = await Deno.open(`${config.dataFolder}/packages/${packageName.replace(/[\/\\]/g, '')}`, { read: true });
    await req.respond({ status: 200, headers: new Headers([
      ['content-type', 'application/octet-stream']
    ]), body: packageFile });
    packageFile.close();
  }},

  {url: /^\/Packages$/, handler: async (req: ServerRequest) => {
    const file = await Deno.open(`${config.dataFolder}/Packages`, { read: true });
    await req.respond({ status: 200, headers: new Headers([
      ['content-type', 'text/plain']
    ]), body: file });
    file.close();
  }},

  {url: /^\/Packages.gz$/, handler: async (req: ServerRequest) => {
    const file = await Deno.open(`${config.dataFolder}/Packages.gz`, { read: true });
    await req.respond({ status: 200, headers: new Headers([
      ['content-type', 'application/octet-stream']
    ]), body: file });
    file.close();
  }},

  {url: /^\/upload$/, handler: async (req: ServerRequest) => {
    if (req.headers.get('secret') !== config.uploadSecret) return await replyBadRequest(req);

    await ensureDir(`${config.dataFolder}/temp/uploads`);
    const tempFilePath = `${config.dataFolder}/temp/uploads/package.deb`;

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
    await ensureDir(`${config.dataFolder}/packages`);
    await move(tempFilePath, `${config.dataFolder}/packages/${debInfo['Package']}_${debInfo['Version']}.deb`, { overwrite: true });
    await Deno.run({
      cmd: ["bash", "-c", "apt-ftparchive packages packages > Packages && gzip -k -f Packages"],
      cwd: config.dataFolder, stdin: "null", stderr: "null", stdout: "null",
    }).status();

    await replyOK(req);
  }}
]

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
