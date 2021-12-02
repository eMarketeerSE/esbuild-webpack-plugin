import { initialize, transform as esBuildTransform } from 'esbuild';
import { Task } from './types';

let _initialized = false;
export const ensureEsbuildInitialized = async () => {
  if (!_initialized) {
    // @ts-ignore
    await initialize();
    _initialized = true
  }
};

export const minify = async ({
  input,
}: Task) => {
  await ensureEsbuildInitialized();
  let error;
  let code;

  try {
    code = await esBuildTransform(input, {
      minify: true,
    })
  } catch (e) {
    error = e;
  }

  return { code: code.js || code.css || '', error };
}

export const transform = async (task: Task) => {
  task = new Function(
    'exports',
    'require',
    'module',
    '__filename',
    '__dirname',
    `'use strict'\nreturn ${task}`
    // @ts-ignore
  )(exports, require, module, __filename, __dirname);

  const result = await minify(task);

  if (result.error) {
    throw result.error;
  } else {
    return result;
  }
}
