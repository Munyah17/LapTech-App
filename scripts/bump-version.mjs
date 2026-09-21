import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../version.json", import.meta.url);
const data = JSON.parse(readFileSync(file, "utf8"));
const next = (Math.round(parseFloat(data.version) * 100) + 1) / 100;
data.version = next.toFixed(2);
writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(`version -> ${data.version}`);
