# The neutral-reference gate from strict-tags-gate/measure-*.json (written by measure.mjs from each transcript's result event).
# python3 -I gate-recount.py
import json, glob, os
G = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "strict-tags-gate")
d = {os.path.basename(f)[8:-5]: json.load(open(f)) for f in sorted(glob.glob(os.path.join(G, "measure-*.json")))}
for k, j in d.items():
    print(f"{k}: turns {j['result_num_turns']}, output tokens {j['result_output_tokens']}, ${j['cost_usd']:.3f}, first tsc errors {j['first_tsc_errors']}, tsc runs {j['tsc_runs']} ({j['tsc_failed_runs']} failed), library lookups {j['lib_lookups']}, tools {j['tool_calls']}")
st = [d["strict-tags-r1"], d["strict-tags-r2"]]; c = [d["control-r1"], d["control-r2"]]
FLOOR = {"turns": (28, 25), "tokens": (18607, 19632), "cost": (0.950, 0.950)}  # Fluent Nine on its task-shaped reference (gate verdict, G1)
for name, key in (("turns", "result_num_turns"), ("tokens", "result_output_tokens")):
    worse, best = max(x[key] for x in st), min(x[key] for x in c)
    print(f"{name}: worse run {worse} against the control's better run {best}: {100 * (1 - worse / best):.2f}% under; the 25% line is {best * 0.75}")
    fb, fw = min(FLOOR[name]), max(FLOOR[name])
    print(f"{name}: worse run {worse} against the floor's better run {fb}: {100 * (worse / fb - 1):+.1f}%; against its worse run {fw}: {100 * (worse / fw - 1):+.1f}%")
cs, cc = sum(x["cost_usd"] for x in st) / 2, sum(x["cost_usd"] for x in c) / 2
print(f"cost: four sessions ${sum(x['cost_usd'] for x in st + c):.2f}; mean ${cs:.3f} against ${cc:.3f} ({100 * (cs / cc - 1):+.1f}%); against the floor's $0.950: {100 * (cs / 0.950 - 1):+.1f}%")
print(f"means: turns {sum(x['result_num_turns'] for x in st) / 2} against {sum(x['result_num_turns'] for x in c) / 2}; tokens {sum(x['result_output_tokens'] for x in st) / 2} against {sum(x['result_output_tokens'] for x in c) / 2}")
