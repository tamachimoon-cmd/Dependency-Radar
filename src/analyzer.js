const LICENSES = {
  mit: "MIT", isc: "ISC", apache: "Apache-2.0", bsd: "BSD-2-Clause", "bsd-2": "BSD-2-Clause",
  "bsd-3": "BSD-3-Clause", gpl: "GPL-3.0", lgpl: "LGPL-3.0", mpl: "MPL-2.0", unlicense: "Unlicense"
};
export function normalizeLicense(value) {
  if (typeof value !== "string" || !value.trim()) return "Não informada";
  return LICENSES[value.trim().toLowerCase()] || value.trim().slice(0, 100);
}
export function classifyVersion(spec) {
  if (typeof spec !== "string") return "inválida";
  const value = spec.trim();
  if (!value) return "inválida";
  if (/^(file:|link:|workspace:|git\+|https?:|github:)/i.test(value)) return "origem externa/local";
  if (value === "*" || value === "latest" || /[xX*]/.test(value)) return "ampla";
  if (/^[~^]/.test(value)) return "faixa semver";
  if (/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(value)) return "fixa";
  if (/[<>=|]/.test(value)) return "intervalo";
  return "não reconhecida";
}
function validObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}
export function analyzeManifest(raw) {
  if (typeof raw !== "string" || raw.length > 2_000_000) throw new Error("Arquivo inválido ou acima de 2 MB.");
  let data;
  try { data = JSON.parse(raw); } catch { throw new Error("JSON inválido."); }
  if (!validObject(data)) throw new Error("O manifesto deve ser um objeto JSON.");
  const sections = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"];
  const dependencies = [];
  for (const section of sections) {
    const group = data[section];
    if (group === undefined) continue;
    if (!validObject(group)) throw new Error(`Campo ${section} deve ser um objeto.`);
    for (const [name, version] of Object.entries(group)) {
      if (dependencies.length >= 5000) throw new Error("Limite de 5.000 dependências excedido.");
      dependencies.push({name, version: String(version), section, classification: classifyVersion(version)});
    }
  }
  dependencies.sort((a,b)=>a.name.localeCompare(b.name) || a.section.localeCompare(b.section));
  const totals = {};
  for (const item of dependencies) totals[item.classification] = (totals[item.classification] || 0) + 1;
  return {project: typeof data.name === "string" ? data.name.slice(0,120) : "Sem nome",
    license: normalizeLicense(data.license), count: dependencies.length, totals, dependencies,
    notes: ["Análise estática do package.json: não consulta registros externos.", "Versões instaladas, vulnerabilidades e licenças das dependências não são verificadas."]};
}
