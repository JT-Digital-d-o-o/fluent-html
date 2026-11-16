#!/bin/sh
# Runs the negative type probes and prints one line per probe: the tag and the first error line.
cd "$(dirname "$0")"
../../../../../node_modules/.bin/tsc -p probes/tsconfig.json --pretty false > out/probes.tsc.txt 2>&1
node -e '
const fs=require("fs");
const src=fs.readFileSync("probes/probes.tsx","utf8").split("\n");
const out=fs.readFileSync("out/probes.tsc.txt","utf8").split("\n");
const byLine={};
for (const l of out){const m=/^probes\/probes\.tsx\((\d+),(\d+)\): error (TS\d+): (.*)$/.exec(l); if(m) (byLine[m[1]]??=[]).push(m[3]+" "+m[4]);}
let err=0, ok=0, miss=[], falsePos=[];
src.forEach((line,i)=>{const m=/^export const (\w+) = .*\/\/ (ERR|OK\??)/.exec(line); if(!m) return; const e=byLine[i+1];
  if(m[2]==="ERR"){ if(e) err++; else miss.push(m[1]); } else { if(e) falsePos.push(m[1]); else ok++; }
  console.log(m[1], m[2], e? e[0].slice(0,330) : "(no error)");});
console.log("\nERR probes rejected:", err, "missed:", miss.join(",")||"none", "| OK probes accepted:", ok, "wrongly rejected:", falsePos.join(",")||"none");
'
