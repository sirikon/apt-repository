import { walk, exists, ensureDir, move } from "std/fs/mod.ts";
import { join, normalize, dirname, basename } from "std/path/mod.ts";
import { getDebInfo } from "@/services/deb.ts";
import config from '@/config.ts';

export async function getPackages(): Promise<string[]> {
  const packagesFolder = data('packages');
  if (!await exists(packagesFolder)) return [];

  const walkPackages = walk(packagesFolder, {
    includeDirs: false,
    maxDepth: 1
  });

  const packages = [];
  for await (const entry of walkPackages) {
    packages.push(entry.name);
  }

  packages.sort();

  return packages
    .filter(n => !n.match(/\.gz$/));
}

export async function savePackage(filePath: string) {
  const debInfo = await getDebInfo(filePath);
  if (debInfo == null) return;

  const targetPath = data(`packages/${getDebFileName(debInfo)}.deb`);
  await ensureDir(data('packages'));
  await move(filePath, targetPath, { overwrite: true });
  await gzipFile(targetPath);
  await refreshDatabase();
}

async function gzipFile(filePath: string) {
  await Deno.run({
    cmd: ["gzip", "-k", "-f", basename(filePath)],
    cwd: dirname(filePath), stdin: "null", stderr: "null", stdout: "null",
  }).status();
}

async function refreshDatabase() {
  await Deno.run({
    cmd: ["bash", "-c", "apt-ftparchive packages packages > Packages && gzip -k -f Packages"],
    cwd: data(''), stdin: "null", stderr: "null", stdout: "null",
  }).status();
}

function getDebFileName(debInfo: { [key: string]: string }) {
  return `${debInfo['Package']}_${debInfo['Version']}`;
}

function data(path: string) {
  return normalize(join(config.dataFolder, path));
}
