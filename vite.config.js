import { defineConfig, minify } from "vite";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

/**
 * Minifies the third-party scripts in vendor/ as the build copies them from
 * public/, which Vite does as is. index.html loads them as classic scripts,
 * so they are minified as scripts: top-level names, which the other scripts
 * use as globals, keep their names, and license comments stay. A file
 * already named .min.js is left alone. The dev server serves the originals.
 */
function minifyVendorScripts() {
  let vendorDir;
  return {
    name: "minify-vendor-scripts",
    apply: "build",
    configResolved(config) {
      vendorDir = resolve(config.root, config.build.outDir, "vendor");
    },
    async closeBundle() {
      const files = (await readdir(vendorDir, { recursive: true })).filter(
        (file) => file.endsWith(".js") && !file.endsWith(".min.js"),
      );
      for (const file of files) {
        const path = join(vendorDir, file);
        const result = await minify(file, await readFile(path, "utf8"), {
          module: false,
          compress: true,
          mangle: true,
          codegen: { legalComments: "inline" },
        });
        if (result.errors.length > 0) {
          throw new Error(
            `Couldn't minify vendor/${file}: ${result.errors[0].message}`,
          );
        }
        await writeFile(path, result.code);
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [minifyVendorScripts()],
  server: {
    port: 9000,
    open: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
