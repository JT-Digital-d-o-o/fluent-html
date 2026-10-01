// Dump the runtime surface of fluent-html 8.1.0: exports + every method name reachable on any element factory's instance.
const m = await import(process.argv[2]);
const exportsList = Object.keys(m).sort();
const methods = new Set();
const perFactory = {};
for (const [name, fn] of Object.entries(m)) {
  if (typeof fn !== "function" || !/^[A-Z]/.test(name)) continue;
  let inst; try { inst = fn(); } catch { continue; }
  if (!inst || typeof inst !== "object") continue;
  const own = new Set();
  let o = inst;
  while (o && o !== Object.prototype) { for (const k of Object.getOwnPropertyNames(o)) if (typeof inst[k] === "function" && k !== "constructor") { methods.add(k); own.add(k); } o = Object.getPrototypeOf(o); }
  perFactory[name] = [...own].sort();
}
console.log(JSON.stringify({ exports: exportsList, methods: [...methods].sort(), perFactory }));
