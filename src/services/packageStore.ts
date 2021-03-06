import { walk, exists, ensureDir, move } from "std/fs/mod.ts";
import { join, normalize } from "std/path/mod.ts";
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

  return packages;
}

export async function savePackage(filePath: string) {
  const debInfo = await getDebInfo(filePath);
  if (debInfo == null) return;

  await ensureDir(data('packages'));
  await move(filePath, data(`packages/${getDebFileName(debInfo)}.deb`), {
    overwrite: true
  });
  await refreshDatabase();
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
