import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = JSON.parse(readFileSync(path.join(root, "app.json"), "utf8")).expo;
const eas = JSON.parse(readFileSync(path.join(root, "eas.json"), "utf8"));
const production = eas.build?.production;
const failures = [];

function requireValue(label, valid) {
  if (valid) {
    console.log(`  PASS  ${label}`);
  } else {
    failures.push(label);
    console.log(`  FAIL  ${label}`);
  }
}

function requireAsset(label, assetPath) {
  requireValue(
    `${label} exists (${assetPath || "not configured"})`,
    typeof assetPath === "string" &&
      existsSync(path.resolve(root, assetPath)),
  );
}

console.log("Play Store AAB preflight");
requireValue("App name is configured", typeof app.name === "string" && app.name.trim().length > 0);
requireValue("Project slug is configured", typeof app.slug === "string" && app.slug.trim().length > 0);
requireValue("App version is valid", /^\d+\.\d+\.\d+([+-][\w.-]+)?$/.test(app.version ?? ""));
requireValue(
  "Android application ID is configured",
  /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/.test(app.android?.package ?? ""),
);
requireValue(
  "EAS project ID is configured",
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    app.extra?.eas?.projectId ?? "",
  ),
);
requireAsset("App icon", app.icon);
requireAsset("Splash image", app.splash?.image);
requireAsset("Android adaptive icon", app.android?.adaptiveIcon?.foregroundImage);
requireValue(
  "Production profile creates a store AAB",
  production?.distribution === "store" &&
    production?.android?.buildType === "app-bundle",
);
requireValue("EAS manages build numbers remotely", eas.cli?.appVersionSource === "remote");
requireValue("Production build increments its version", production?.autoIncrement === true);

console.log("");
if (failures.length > 0) {
  console.error(`Preflight blocked: fix ${failures.length} item(s) above before building.`);
  process.exitCode = 1;
} else {
  console.log("AAB preflight passed. This does not verify Play Console listing or policy readiness.");
}

console.log("");
console.log("Before publishing, verify in Play Console:");
console.log("  - App listing, support contact, privacy policy, screenshots, and app icon");
console.log("  - Data safety, content rating, target audience, and required access instructions");
console.log("  - Rights to use third-party names, logos, and other branding in the app and listing");
