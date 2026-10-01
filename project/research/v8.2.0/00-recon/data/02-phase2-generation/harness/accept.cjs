// Browser acceptance for the Team task. Every check is a sentence of the task prompt, nothing else.
// usage: node accept.cjs <baseUrl> <runName>
const { chromium } = require("playwright");
const base = process.argv[2];
const run = process.argv[3];
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const results = [];
const check = (id, ok, detail = "") => results.push({ id, ok: !!ok, detail: String(detail).slice(0, 300) });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoleErrors = [];
  const badResponses = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + String(e.message).slice(0, 200)));
  page.on("response", (r) => { if (r.status() >= 400) badResponses.push(`${r.status()} ${r.request().method()} ${new URL(r.url()).pathname}`); });

  const me = `owner-${run}@probe.test`;
  try {
    await page.goto(base + "/auth/register");
    await page.fill('input[name="name"]', "Probe Owner");
    await page.fill('input[name="email"]', me);
    await page.fill('input[name="password"]', "correct-horse-battery");
    await page.fill('input[name="passwordConfirm"]', "correct-horse-battery");
    await page.check('input[name="acceptTerms"]');
    await Promise.all([page.waitForLoadState("networkidle"), page.click('button[type="submit"]')]);
    await page.waitForTimeout(800);
    await page.goto(base + "/account");
    check("harness-signed-in", new URL(page.url()).pathname.startsWith("/account"), `after register, /account -> ${new URL(page.url()).pathname}`);

    // "Add a link to the page in the app's main navigation."
    await page.goto(base + "/");
    const navLinks = await page.$$eval("a", (as) => as.filter((a) => /\bteam\b/i.test(a.textContent || "")).map((a) => a.outerHTML.slice(0, 200)));
    check("nav-link", navLinks.length > 0, navLinks[0] || "no <a> with text 'Team' on /");

    // "Route: /team, for signed-in users only."
    const resp = await page.goto(base + "/team");
    check("page-200", resp && resp.status() === 200, resp && resp.status());
    const ctx2 = await browser.newContext();
    const anon = await ctx2.newPage();
    const anonResp = await anon.goto(base + "/team");
    check("anon-blocked", !/\/team$/.test(new URL(anon.url()).pathname) || (anonResp && anonResp.status() >= 400), `anon landed on ${new URL(anon.url()).pathname} (${anonResp && anonResp.status()})`);
    await ctx2.close();

    const bodyText = async () => page.evaluate(() => document.body.innerText);
    const emailsOnPage = async () => [...new Set(((await bodyText()).match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || []).filter((e) => e !== me))];
    const seeded = await emailsOnPage();
    check("seed-3", seeded.length >= 3, `emails listed: ${seeded.length} ${seeded.join(",")}`);
    const statusWords = /\b(active|invited)\b/i.test(await bodyText());
    check("status-shown", statusWords, "active/invited text");

    await page.evaluate(() => { window.__probe = 42; });
    const stillSamePage = async () => page.evaluate(() => window.__probe === 42);

    // "A search box above the list filters members by name or email as the user types, without a full page reload."
    const search = await page.$('input[type="search"]') || await page.$('input[name="q"]') || await page.$('input[name="search"]') || await page.$('input[name="query"]') || await page.$('input[placeholder*="earch" i]');
    check("search-input", !!search, search ? await search.evaluate((e) => e.outerHTML.slice(0, 250)) : "none");
    if (search && seeded.length) {
      const target = seeded[0];
      const local = target.split("@")[0].slice(0, 5);
      await search.click();
      await search.focus(); await page.keyboard.type(local, { delay: 60 });
      await page.waitForTimeout(1800);
      const after = await emailsOnPage();
      check("search-filters", after.includes(target) && after.length < seeded.length, `typed "${local}" -> ${after.length} emails (${after.join(",")})`);
      check("search-no-reload", await stillSamePage(), "window marker survived");
      await search.fill("");
      await search.focus(); await page.keyboard.type("zzqx", { delay: 60 });
      await page.waitForTimeout(1800);
      const t = await bodyText();
      check("no-results-names-query", /zzqx/.test(t) && (await emailsOnPage()).length === 0, (t.match(/.{0,60}zzqx.{0,40}/) || ["query not in text"])[0]);
      await search.fill("");
      await search.focus(); await page.keyboard.type(" ", { delay: 60 }); await page.keyboard.press("Backspace");
      await page.waitForTimeout(1800);
      check("search-cleared-restores", (await emailsOnPage()).length >= seeded.length, `after clearing: ${(await emailsOnPage()).length}`);
    }

    // Invite form: name, email, role
    const form = await page.$('form:has(input[name="email"]):has(input[name="name"])');
    check("invite-form", !!form, form ? "found" : "no form with name+email inputs");
    if (form) {
      const role = await form.$('select[name="role"], input[name="role"]');
      check("invite-role-field", !!role, role ? await role.evaluate((e) => e.tagName) : "none");
      const submit = await form.$('button[type="submit"], button:not([type]), input[type="submit"]');

      // 1) natural invalid submit — does the browser's own validation block it?
      await form.$eval('input[name="name"]', (e) => (e.value = ""));
      await form.$eval('input[name="email"]', (e) => (e.value = "not-an-email"));
      const nativeValid = await form.evaluate((f) => f.checkValidity());
      check("native-validation-blocks", !nativeValid, `form.checkValidity()=${nativeValid}`);

      // 2) server-side validation path (native validation off, as a no-JS client or a script would submit)
      await form.evaluate((f) => { f.noValidate = true; });
      await submit.click();
      await page.waitForTimeout(1500);
      const form2 = await page.$('form:has(input[name="email"]):has(input[name="name"])');
      const ftext = form2 ? await form2.evaluate((f) => f.innerText) : "";
      if (process.env.DUMP && form2) require("fs").writeFileSync(process.env.DUMP.replace(/\.html$/, "-422.html"), await form2.evaluate((f) => f.closest("section, div")?.outerHTML || f.outerHTML));
      check("invalid-shows-errors", /required|valid|enter|missing/i.test(ftext), ftext.replace(/\s+/g, " ").slice(0, 200));
      const kept = form2 ? await form2.$eval('input[name="email"]', (e) => e.value) : null;
      check("invalid-keeps-input", kept === "not-an-email", `email value after 422: ${JSON.stringify(kept)}`);
      check("invalid-no-reload", await stillSamePage(), "marker");

      // 3) duplicate email
      if (form2 && seeded.length) {
        await form2.evaluate((f) => { f.noValidate = true; });
        await form2.$eval('input[name="name"]', (e) => (e.value = "Dup Person"));
        await form2.$eval('input[name="email"]', (e, v) => (e.value = v), seeded[0]);
        await (await form2.$('button[type="submit"], button:not([type]), input[type="submit"]')).click();
        await page.waitForTimeout(1500);
        const form3 = await page.$('form:has(input[name="email"]):has(input[name="name"])');
        const t3 = form3 ? await form3.evaluate((f) => f.innerText) : "";
        check("duplicate-rejected", /already|exists|taken|member|in use/i.test(t3) && (await emailsOnPage()).filter((e) => e === seeded[0]).length === 1, t3.replace(/\s+/g, " ").slice(0, 200));
      }

      // 4) valid invite
      const newEmail = `probe.person.${run}@example.com`;
      const form4 = await page.$('form:has(input[name="email"]):has(input[name="name"])');
      await form4.$eval('input[name="name"]', (e) => (e.value = "Probe Person"));
      await form4.$eval('input[name="email"]', (e, v) => (e.value = v), newEmail);
      const sel = await form4.$('select[name="role"]');
      if (sel) { const opts = await sel.$$eval("option", (os) => os.map((o) => o.value)); if (opts.includes("admin")) await sel.selectOption("admin"); }
      await (await form4.$('button[type="submit"], button:not([type]), input[type="submit"]')).click();
      await page.waitForTimeout(1800);
      const listed = (await emailsOnPage()).includes(newEmail);
      check("valid-appears-in-list", listed, `new email listed: ${listed}`);
      const form5 = await page.$('form:has(input[name="email"]):has(input[name="name"])');
      const resetVals = form5 ? await form5.evaluate((f) => [f.querySelector('input[name="name"]').value, f.querySelector('input[name="email"]').value]) : null;
      check("valid-form-resets", resetVals && resetVals[0] === "" && resetVals[1] === "", JSON.stringify(resetVals));
      check("valid-no-reload", await stillSamePage(), "marker");
      const rows = await page.evaluate((em) => [...document.querySelectorAll("tr, li, [role=row], article")].filter((n) => !n.closest("form") && !n.closest("[role=status]") && n.innerText && n.innerText.includes(em) && n.innerText.length < 400).map((n) => n.innerText), newEmail);
      check("new-member-invited", rows.some((r) => /invited/i.test(r)), (rows[0] || "no tr/li/row/article holds the new email").replace(/\s+/g, " ").slice(0, 160));

      // full reload keeps it (in-memory store)
      await page.goto(base + "/team");
      check("persisted-after-reload", (await emailsOnPage()).includes(newEmail), "after full GET /team");
      if (process.env.DUMP) require("fs").writeFileSync(process.env.DUMP, await page.content());
    }
  } catch (e) {
    check("script-error", false, e.message);
  }
  const realConsole = consoleErrors.filter((c) => !/status of 422/.test(c));
  check("no-console-errors", realConsole.length === 0, realConsole.join(" || "));
  const unexpected = badResponses.filter((r) => !/^422 /.test(r) && !/favicon/.test(r));
  check("no-unexpected-4xx-5xx", unexpected.length === 0, badResponses.join(" | "));
  console.log(JSON.stringify({ run, passed: results.filter((r) => r.ok).length, total: results.length, results }, null, 1));
  await browser.close();
})();
