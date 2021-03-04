export default {
  port: getPort(),
  dataFolder: getDataFolder()
}

function getPort() {
  const envPort = Deno.env.get('PORT');
  return envPort ? parseInt(envPort) : 80;
}

function getDataFolder() {
  return Deno.env.get('DATA_FOLDER') || './data';
}
