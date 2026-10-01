const ORG_ROOT = process.env.ORG_ROOT;
if (!ORG_ROOT) throw new Error("set ORG_ROOT to the directory holding the repo checkouts");
const { resolveSetupConfig, scaffold } = await import(`${ORG_ROOT}/projects-template/templates/full-stack/setup.ts`);
const out = process.argv[2];
const config = resolveSetupConfig({ projectName: "teamapp", database: "sqlite", modules: ["auth"] }, (m) => console.log("note:", m));
scaffold(`${ORG_ROOT}/projects-template`, out, config);
console.log("scaffolded", out, config.modules);
