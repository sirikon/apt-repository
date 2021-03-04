export default {
  port: getPort(80),
  dataFolder: getDataFolder('./data'),
  uploadSecret: getUploadSecret()
}

function getPort(fallback: number) {
  const envPort = Deno.env.get('PORT');
  return envPort ? parseInt(envPort) : fallback;
}

function getDataFolder(fallback: string) {
  return Deno.env.get('DATA_FOLDER') || fallback;
}

function getUploadSecret() {
  const value = Deno.env.get('UPLOAD_SECRET');
  if (!value) throw new Error('UPLOAD_SECRET env var is required');
  return value;
}
