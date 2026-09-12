import { resolve as pathResolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, statSync } from 'node:fs';

export async function resolve(specifier, context, nextResolve) {
  let targetPath = null;

  if (specifier.startsWith('@/')) {
    const subpath = specifier.slice(2);
    const candidates = [
      `./src/${subpath}.ts`,
      `./src/${subpath}.tsx`,
      `./src/${subpath}/index.ts`,
      `./src/${subpath}/index.tsx`,
      `./src/${subpath}.js`,
      `./src/${subpath}/index.js`,
      `./src/${subpath}`,
    ];

    for (const cand of candidates) {
      const fullPath = pathResolve(process.cwd(), cand);
      if (existsSync(fullPath)) {
        try {
          if (statSync(fullPath).isFile()) {
            targetPath = fullPath;
            break;
          }
        } catch {}
      }
    }
  } else if (specifier.startsWith('./') || specifier.startsWith('../')) {
    if (context.parentURL && context.parentURL.startsWith('file://')) {
      const parentDir = dirname(fileURLToPath(context.parentURL));
      const candidates = [
        pathResolve(parentDir, specifier + '.ts'),
        pathResolve(parentDir, specifier + '.tsx'),
        pathResolve(parentDir, specifier + '/index.ts'),
        pathResolve(parentDir, specifier + '/index.tsx'),
        pathResolve(parentDir, specifier + '.js'),
        pathResolve(parentDir, specifier + '/index.js'),
        pathResolve(parentDir, specifier),
      ];

      for (const fullPath of candidates) {
        if (existsSync(fullPath)) {
          try {
            if (statSync(fullPath).isFile()) {
              targetPath = fullPath;
              break;
            }
          } catch {}
        }
      }
    }
  }

  if (targetPath) {
    return nextResolve(pathToFileURL(targetPath).href, context);
  }

  return nextResolve(specifier, context);
}
