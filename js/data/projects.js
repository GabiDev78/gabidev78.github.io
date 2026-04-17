/**
 * Personal / academic projects.
 */

import { c, accent, accent2, bold, dim, muted } from "../render.js";

export const projects = {
  id: "projects",
  label: "Projects",
  modules: [
    {
      id: "delphi-scanner",
      title: "Delphi Scanner",
      org: "academic",
      period: "Master",
      tags: ["malware", "ml", "cnn", "windows", "rust", "python", "ts"],
      summary: "CNN-based Windows malware detection from API-call sequences (PE files).",
      detail: () => c`
${bold(accent("Delphi Scanner"))}  ${dim("· Master")}

  ${muted("•")} Windows malware detector with behavioral interpretation.
  ${muted("•")} Models Windows API-call sequences with a convolutional neural network (CNN) to classify PE files.
  ${muted("•")} End-to-end pipeline: sample instrumentation, sequence extraction, model training, classification.

${dim("stack:")} Rust, Python, TypeScript
`,
      links: [],
    },
    {
      id: "cve-attack-mapper",
      title: "CVE → MITRE ATT&CK filler",
      org: "academic",
      period: "Master",
      tags: ["ml", "cve", "mitre-attack", "nlp", "python"],
      summary: "Fill missing CVE → CWE → CAPEC → ATT&CK mappings using ML models.",
      detail: () => c`
${bold(accent("CVE → MITRE ATT&CK mapping filler"))}  ${dim("· Master")}

  ${muted("•")} Fills the gaps in the CVE → CWE → CAPEC → ATT&CK chain where official mappings are missing.
  ${muted("•")} Ensemble of classical and transformer-based models (xgboost, BERT, ensemble voting).
  ${muted("•")} Feeds downstream threat-intel and attack-path workflows.

${dim("stack:")} Python, xgboost, BERT
`,
      links: [],
    },
    {
      id: "password-cracking-lab",
      title: "Password cracking lab",
      org: "academic",
      period: "Master",
      tags: ["offensive", "passwords", "python"],
      summary: "Lab to benchmark and compare password-cracking methods.",
      detail: () => c`
${bold(accent("Password-cracking lab"))}  ${dim("· Master")}

  ${muted("•")} Reproducible lab environment for testing different password-cracking strategies
      (dictionary, rule-based, mask, hybrid).
  ${muted("•")} Comparative benchmarks across hash types and datasets.

${dim("stack:")} Python
`,
      links: [],
    },
    {
      id: "cve-scan-automator",
      title: "Vulnerability scan automator",
      org: "academic",
      period: "Licence",
      tags: ["cve", "automation", "python", "web"],
      summary: "Automates CVE scans against servers and reports new findings.",
      detail: () => c`
${bold(accent("Vulnerability scan automator"))}  ${dim("· Licence")}

  ${muted("•")} Schedules and runs CVE scans against target servers.
  ${muted("•")} Detects newly-introduced vulnerabilities and surfaces a custom report.
  ${muted("•")} Lightweight web UI for browsing findings.

${dim("stack:")} Python, JavaScript, HTML, CSS
`,
      links: [],
    },
    {
      id: "mini-dbms",
      title: "Simple optimized DBMS",
      org: "academic",
      period: "Licence",
      tags: ["databases", "systems", "python"],
      summary: "DBMS built from scratch: disk + in-memory layers, query parsing.",
      detail: () => c`
${bold(accent("Simple optimized DBMS"))}  ${dim("· Licence")}

  ${muted("•")} Relational database engine designed and implemented from scratch.
  ${muted("•")} Disk layer, byte-level memory management, and a query parser.
  ${muted("•")} Exercise in trade-offs between throughput, memory footprint, and code clarity.

${dim("stack:")} Python
`,
      links: [],
    },
    {
      id: "rectangle-packing",
      title: "NP-hard Rectangle Packing solver",
      org: "academic",
      period: "Licence",
      tags: ["algorithms", "np-hard", "concurrency", "python"],
      summary: "Solver for Rectangle Packing with heuristics and approximation algorithms.",
      detail: () => c`
${bold(accent("NP-hard Rectangle Packing solver"))}  ${dim("· Licence")}

  ${muted("•")} Solves Rectangle Packing problems using multiple heuristics and approximation algorithms.
  ${muted("•")} Concurrent execution of candidate strategies to compare quality vs. runtime.

${dim("stack:")} Python, concurrency primitives
`,
      links: [],
    },
    {
      id: "unity-mp-game",
      title: "Unity multiplayer game",
      org: "team project",
      period: "EPITA",
      tags: ["gamedev", "unity", "csharp", "networking"],
      summary: "Built the multiplayer layer and 3D assets for a Unity game.",
      detail: () => c`
${bold(accent("Unity multiplayer game"))}  ${dim("· EPITA")}

  ${muted("•")} Developed the multiplayer networking layer.
  ${muted("•")} Authored and integrated 3D models into the game.

${dim("stack:")} C#, Unity
`,
      links: [],
    },
    {
      id: "evrisops",
      title: "EVRISOPS — civic app",
      org: "team project",
      period: "pre-2019",
      tags: ["civic", "backend", "nosql", "award"],
      summary: "Back-end for a civic app — National winner, Charlemagne Youth Prize.",
      detail: () => c`
${bold(accent("EVRISOPS"))}  ${dim("· civic application")}

  ${muted("•")} Built the back-end, including a NoSQL data layer.
  ${muted("•")} Team project on civic engagement.
  ${muted("•")} ${accent2("National winner")} of the ${bold("Charlemagne Youth Prize for Europe")}.

${dim("stack:")} Python, HTML, JavaScript, NoSQL
`,
      links: [],
    },
  ],
};
