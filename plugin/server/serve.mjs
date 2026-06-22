// Minimal HTTPS static server for the R1 verification plug-in.
// Serves plugin.json (manifest) + the ui/ assets over TLS, which is the
// hard requirement for vSphere Client remote plug-in registration.
//
// Usage:
//   1. Generate a self-signed cert (see scripts/gen-cert.sh) with the SAN set
//      to this host's FQDN — vCenter rejects certs whose subjectAltName does
//      not contain the plug-in server hostname (RFC 2818).
//   2. node plugin/server/serve.mjs --cert ./certs/server.crt --key ./certs/server.key --port 8443
//
// This is for R1 testing only. Production serving belongs to the Java 17
// plug-in server (see HLD §4).

import https from "node:https";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = join(__dirname, "..");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const port = Number(arg("port", "8443"));
const certPath = arg("cert");
const keyPath = arg("key");

if (!certPath || !keyPath) {
  console.error("ERROR: --cert and --key are required. See scripts/gen-cert.sh.");
  process.exit(1);
}

// Map request paths to files. Manifest is exposed at /plugin.json.
const ROUTES = {
  // vSphere 9.x downloads the plug-in as a .zip package (client.url -> plugin.zip),
  // not a bare plugin.json. Build it with scripts/build-zip.sh first.
  "/plugin.zip": { file: join(PLUGIN_ROOT, "dist", "plugin.zip"), type: "application/zip" },
  "/plugin.json": { file: join(PLUGIN_ROOT, "manifest", "plugin.json"), type: "application/json" },
  "/": { file: join(PLUGIN_ROOT, "ui", "index.html"), type: "text/html; charset=utf-8" },
  "/index.html": { file: join(PLUGIN_ROOT, "ui", "index.html"), type: "text/html; charset=utf-8" },
  "/locale-probe.js": { file: join(PLUGIN_ROOT, "ui", "locale-probe.js"), type: "application/javascript; charset=utf-8" },
};

const [cert, key] = await Promise.all([readFile(certPath), readFile(keyPath)]);

https
  .createServer({ cert, key }, async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "https://x").pathname));
    const peer = req.socket.remoteAddress;
    const ts = new Date().toISOString();
    const route = ROUTES[path];
    if (!route) {
      console.log(`[${ts}] ${peer} ${req.method} ${path} -> 404`);
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("404");
      return;
    }
    console.log(`[${ts}] ${peer} ${req.method} ${path} -> 200`);
    try {
      const body = await readFile(route.file);
      // CORS + framing: vSphere Client loads plug-in UI inside its own frame.
      res.writeHead(200, {
        "content-type": route.type,
        "access-control-allow-origin": "*",
      });
      res.end(body);
    } catch (err) {
      res.writeHead(500, { "content-type": "text/plain" });
      res.end("500: " + err.message);
    }
  })
  .listen(port, () => {
    console.log(`R1 plug-in server on https://0.0.0.0:${port}`);
    console.log(`  manifest:  https://<this-host-fqdn>:${port}/plugin.json`);
    console.log(`  use that URL as -pluginUrl when registering (see scripts/register.sh)`);
  });
