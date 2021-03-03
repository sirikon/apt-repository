import { ServerRequest } from "https://deno.land/std@0.88.0/http/server.ts";
import { ensureDir, move } from "https://deno.land/std@0.89.0/fs/mod.ts";
import { replyBadRequest, replyOK, replyTemplate } from "./web/reply.ts";

export default [
  {url: /^\/$/, handler: async (req: ServerRequest) => {
    await replyTemplate(req, 'index.ejs', {})
  }},
  {url: /^\/upload$/, handler: async (req: ServerRequest) => {
    await ensureDir('./data/temp/uploads');
    const tempFilePath = `./data/temp/uploads/package.deb`;

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
    await ensureDir('./data/packages');
    await move(tempFilePath, `./data/packages/${debInfo['Package']}_${debInfo['Version']}.deb`, { overwrite: true });
    await Deno.run({
      cmd: ["bash", "-c", "apt-ftparchive packages packages > Packages && gzip -k -f Packages"],
      cwd: './data', stdin: "null", stderr: "null", stdout: "null",
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
