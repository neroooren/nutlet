import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

import sourcemaps from 'rollup-plugin-sourcemaps'

const packagesRoot = join(__dirname, 'packages')
const packages = readdirSync(packagesRoot)
  .map((name) => join(packagesRoot, name))
  .filter((path) => statSync(path).isDirectory() && existsSync(join(path, 'package.json')))

const options = packages.map(
  /** @type {(path: string) => import('rollup').RollupOptions} */
  (packageRoot) => ({
    input: `${packageRoot}/esnext/index.js`,
    external: ['react', 'stylis', '@emotion/hash'],
    plugins: [sourcemaps()],
    output: [
      {
        file: `${packageRoot}/dist/index.js`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `${packageRoot}/esm/index.mjs`,
        format: 'es',
        sourcemap: true,
      },
    ],
  }),
)

export default options
