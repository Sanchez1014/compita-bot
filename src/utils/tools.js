import fs from 'fs';
import fsExtra from 'fs-extra';

export function readJSON(path, defaultValue = {}) {
  try {
    if (!fs.existsSync(path)) {
      fsExtra.ensureFileSync(path);
      fs.writeFileSync(path, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const raw = fs.readFileSync(path, 'utf8') || '{}';
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo JSON', path, e);
    return defaultValue;
  }
}

export function writeJSON(path, data) {
  try {
    fsExtra.ensureFileSync(path);
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error escribiendo JSON', path, e);
  }
}

export function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}