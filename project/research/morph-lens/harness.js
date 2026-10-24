// In-page harness: mounts a server render, applies client edits, morphs to the next render
// with htmx 4's outerMorph, and reports what survived. Loaded after htmx.min.js.
window.T = (() => {
  const root = () => document.getElementById("root");

  function canon(n) {
    if (n.nodeType === 3) return JSON.stringify(n.nodeValue);
    if (n.nodeType !== 1) return "";
    const attrs = [...n.attributes].map((a) => a.name + "=" + JSON.stringify(a.value)).sort().join(" ");
    const kids = [];
    let text = null;
    const flush = () => { if (text) kids.push(JSON.stringify(text)); text = null; };
    const childNodes = n.tagName === "TEMPLATE" ? n.content.childNodes : n.childNodes;
    for (const c of childNodes) {
      if (c.nodeType === 3) { text = (text ?? "") + c.nodeValue; continue; }
      if (c.nodeType !== 1) continue;
      flush();
      kids.push(canon(c));
    }
    flush();
    return `<${n.tagName.toLowerCase()}${attrs ? " " + attrs : ""}>${kids.join("")}</>`;
  }

  function fresh(html) {
    const t = document.createElement("template");
    t.innerHTML = `<div id="root">${html}</div>`;
    return t.content.firstElementChild;
  }

  function mount(html) {
    document.body.innerHTML = `<div id="root">${html}</div>`;
  }

  async function morph(html) {
    await htmx.swap({ target: root(), text: `<div id="root">${html}</div>`, swap: "outerMorph" });
  }

  function describe(e) {
    let s = e.tagName.toLowerCase();
    if (e.id) s += "#" + e.id;
    if (e.getAttribute("type")) s += `[type=${e.getAttribute("type")}]`;
    if (e.classList.length) s += "." + [...e.classList].join(".");
    return s;
  }

  // Each kind of client-owned state: where it can live, how a reader or script makes it, whether
  // it is still there, and the server's own declaration about it (null: the server never says).
  const EDITS = {
    type: {
      sel: "input[type=text]",
      apply: (e) => { e.value = "typed!"; },
      holds: (e) => e.value === "typed!",
      sig: (e) => e.getAttribute("value"),
    },
    check: {
      sel: "input[type=checkbox]",
      apply: (e) => { e.__want = !e.checked; e.checked = e.__want; },
      holds: (e) => e.checked === e.__want,
      sig: (e) => e.hasAttribute("checked"),
    },
    select: {
      sel: "select",
      apply: (e) => { e.__want = (e.selectedIndex + 1) % e.options.length; e.selectedIndex = e.__want; },
      holds: (e) => e.selectedIndex === e.__want,
      sig: (e) => [...e.options].map((o) => o.hasAttribute("selected")).join(),
    },
    textarea: {
      sel: "textarea",
      apply: (e) => { e.value = "typed!"; },
      holds: (e) => e.value === "typed!",
      sig: (e) => e.defaultValue,
    },
    details: {
      sel: "details",
      apply: (e) => { e.__want = !e.open; e.open = e.__want; },
      holds: (e) => e.open === e.__want,
      sig: null, // set below from the server's attribute before the toggle
    },
    attr: {
      sel: "#root *",
      apply: (e) => e.setAttribute("data-client", "1"),
      holds: (e) => e.getAttribute("data-client") === "1",
      sig: null,
    },
    child: {
      sel: "#root div, #root span, #root section, #root li",
      apply: (e) => {
        const i = document.createElement("i");
        i.setAttribute("data-client-node", "");
        e.appendChild(i);
        e.__child = i;
      },
      holds: (e) => e.__child.parentNode === e,
      sig: null,
    },
    src: {
      sel: "img[data-src]",
      apply: (e) => { e.src = e.getAttribute("data-src"); },
      holds: (e) => e.getAttribute("src") === e.getAttribute("data-src"),
      sig: null,
    },
    scroll: {
      sel: ".scroller",
      apply: (e) => { e.scrollTop = 40; e.__want = e.scrollTop; },
      holds: (e) => e.__want > 0 && e.scrollTop === e.__want,
      sig: null,
    },
    focus: {
      sel: "input, textarea, select, button",
      apply: (e) => e.focus(),
      holds: (e) => document.activeElement === e,
      sig: null,
    },
  };

  async function run(c) {
    mount(c.h1);
    const ids = new Map();
    root().querySelectorAll("[id]").forEach((e) => ids.set(e.id, e));
    const done = [];
    for (const ed of c.edits) {
      const spec = EDITS[ed.kind];
      const cands = [...root().querySelectorAll(spec.sel)];
      if (!cands.length) { done.push({ kind: ed.kind, skipped: true }); continue; }
      const e = cands[ed.pick % cands.length];
      const sigBefore = ed.kind === "details" ? e.hasAttribute("open") : spec.sig ? spec.sig(e) : null;
      spec.apply(e);
      // A control inside a closed <details> takes no focus and no scroll: the edit never happened.
      if (!spec.holds(e)) { done.push({ kind: ed.kind, skipped: true }); continue; }
      done.push({ kind: ed.kind, e, sigBefore, desc: describe(e) });
    }
    await morph(c.h2);
    const want = fresh(c.h2);
    const out = { canon: canon(root()), want: canon(want), edits: [], ids: [] };
    for (const x of done) {
      if (x.skipped) { out.edits.push({ kind: x.kind, skipped: true }); continue; }
      const spec = EDITS[x.kind];
      const connected = root().contains(x.e);
      let serverChanged = false;
      if (connected && x.kind === "details") serverChanged = false; // judged in Node from the trees when needed
      else if (connected && spec.sig) serverChanged = spec.sig(x.e) !== x.sigBefore;
      out.edits.push({ kind: x.kind, desc: x.desc, connected, serverChanged, holds: connected && spec.holds(x.e) });
    }
    for (const [id, e] of ids) {
      const w = want.querySelector(`[id="${id}"]`);
      if (!w || w.tagName !== e.tagName) continue;
      out.ids.push({ id, tag: e.tagName.toLowerCase(), kept: root().querySelector(`[id="${id}"]`) === e });
    }
    return out;
  }

  // One control, its server declarations before and after, and what the reader did to it.
  const CONTROLS = {
    text: {
      h: (v) => `<input id="c" type="text" value="${v}">`,
      touch: (e) => { e.value = "client"; },
      shows: (e) => e.value,
      focusable: (e) => e,
    },
    textarea: {
      h: (v) => `<textarea id="c">${v}</textarea>`,
      touch: (e) => { e.value = "client"; },
      shows: (e) => e.value,
      focusable: (e) => e,
    },
    checkbox: {
      // The reader's mark is the opposite of the old declaration; "new" declares it checked.
      h: (v) => `<input id="c" type="checkbox"${v === "new" ? " checked" : ""}>`,
      touch: (e) => { e.checked = true; e.checked = false; e.__client = "client"; },
      shows: (e) => (e.__client && !e.checked ? "client" : e.checked ? "new" : "old"),
      focusable: (e) => e,
    },
    select: {
      h: (v) => `<select id="c"><option value="old"${v === "old" ? " selected" : ""}>old</option><option value="new"${v === "new" ? " selected" : ""}>new</option><option value="client">client</option></select>`,
      touch: (e) => { e.value = "client"; },
      shows: (e) => e.value,
      focusable: (e) => e,
    },
    details: {
      // "new" declares it open. Its state is the attribute itself, with no dirty flag, so a toggle
      // against a changing declaration is indistinguishable from obeying it: only "same" is asked.
      h: (v) => `<details id="c"${v === "new" ? " open" : ""}${window.__keepOpen ? " data-keep-open" : ""}><summary>s</summary>body</details>`,
      touch: (e) => { e.__client = !e.open; e.open = e.__client; },
      shows: (e) => (e.__client !== undefined ? (e.open === e.__client ? "client" : "old") : e.open ? "new" : "old"),
      focusable: (e) => e.querySelector("summary"),
    },
  };

  async function form(c) {
    const ctl = CONTROLS[c.control];
    const s1 = "old";
    const s2 = c.server === "changes" ? "new" : "old";
    mount(ctl.h(s1));
    const e = document.getElementById("c");
    if (c.touched) ctl.touch(e);
    if (c.focused) { const f = ctl.focusable(e); f.tabIndex = f.tabIndex; f.focus(); }
    await morph(ctl.h(s2));
    const now = document.getElementById("c");
    return { same: now === e, shows: ctl.shows(now) };
  }

  // Rows without ids: the reader typed into row `typed`; the server removes or adds rows and may relabel.
  async function align(c) {
    const row = (label, k) => `<li><span>${label}</span><input type="text" value=""></li>`;
    const h1 = `<ul>${c.labels1.map(row).join("")}</ul>`;
    const h2 = `<ul>${c.labels2.map(row).join("")}</ul>`;
    mount(h1);
    const inputs = [...root().querySelectorAll("input")];
    inputs[c.typed].value = "typed!";
    inputs.forEach((e, i) => { e.__row = c.labels1[i]; });
    await morph(h2);
    const holder = [...root().querySelectorAll("input")].find((e) => e.value === "typed!");
    return {
      typedLabel: c.labels1[c.typed],
      nowUnder: holder ? holder.parentElement.querySelector("span").textContent : null,
      rows: [...root().querySelectorAll("li")].map((li) => ({ label: li.querySelector("span").textContent, value: li.querySelector("input").value })),
    };
  }

  // A keyed list reordered: does the moved row keep its focus, its scroll and its identity?
  async function move(c) {
    const row = (k) => `<li id="r${k}"><input type="text" value="${k}"><div class="scroller" style="overflow:auto;height:20px"><div style="height:200px"></div></div></li>`;
    mount(`<ul>${c.order1.map(row).join("")}</ul>`);
    const li = document.getElementById("r" + c.moved);
    const input = li.querySelector("input");
    const scroller = li.querySelector(".scroller");
    scroller.scrollTop = 40;
    input.focus();
    let blurred = false;
    input.addEventListener("blur", () => { blurred = true; });
    await morph(`<ul>${c.order2.map(row).join("")}</ul>`);
    return {
      moveBefore: typeof Element.prototype.moveBefore === "function",
      same: document.getElementById("r" + c.moved) === li,
      focusKept: document.activeElement === input,
      blurred,
      scrollKept: scroller.scrollTop === 40,
    };
  }

  return { run, form, align, move };
})();
