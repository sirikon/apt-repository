export async function isValidDeb(debPath: string): Promise<boolean> {
  const debInfo = await getDebInfo(debPath);
  return debInfo != null;
}

export async function getDebInfo(debPath: string): Promise<{ [key: string]: string } | null> {
  const p = Deno.run({
    cmd: ["dpkg", "-I", debPath],
    stdin: "null",
    stderr: "null",
    stdout: "piped",
  });
  const [status, stdout] = await Promise.all([
    p.status(),
    p.output()
  ]);
  p.close();
  if (!status.success) {
    return null;
  }
  return parseDebInfo(new TextDecoder().decode(stdout));
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
