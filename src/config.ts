export default {
  port: getEnvVar('PORT', '80'),
  dataFolder: getEnvVar('DATA_FOLDER'),
  uploadSecret: getEnvVar('UPLOAD_SECRET')
}

function getEnvVar(key: string, fallback?: string) {
  const value = Deno.env.get(key);
  if (value == null) {
    if (fallback == null) throw new Error(`${key} env var is required`)
    return fallback;
  }
  return value;
}
