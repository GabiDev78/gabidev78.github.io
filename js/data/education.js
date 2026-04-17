/**
 * Education entries. Same module schema as experience.
 */

import { c, accent, accent2, bold, dim, muted } from "../render.js";

export const education = {
  id: "education",
  label: "Education",
  modules: [
    {
      id: "msc-cyber",
      title: "MSc Cybersecurity",
      org: "Université Paris Descartes — UFR Bio Fondamentales",
      period: "2024 — 2026",
      tags: ["master", "cybersecurity"],
      summary: "Master 2 Cybersecurity. Apprenticeship track with Thales LAS.",
      detail: () => c`
${bold(accent("MSc Cybersecurity"))}
${accent2("Université Paris Descartes — UFR Bio Fondamentales")}  ${muted("·")}  ${dim("2024 — 2026")}

  ${muted("•")} Master 2 specializing in cybersecurity, Paris 6ᵉ.
  ${muted("•")} Apprenticeship track, paired with the role at Thales LAS.
`,
      links: [],
    },
    {
      id: "licence-math-info",
      title: "BSc Maths & Computer Science — CS track",
      org: "Université Paris Descartes — UFR MathInfo",
      period: "2021 — 2024",
      tags: ["licence", "cs", "maths"],
      summary: "Three-year Licence in Mathematics and Computer Science, CS specialization.",
      detail: () => c`
${bold(accent("Licence Mathématiques et Informatique — parcours Informatique"))}
${accent2("Université Paris Descartes — UFR MathInfo")}  ${muted("·")}  ${dim("2021 — 2024")}

  ${muted("•")} Three-year undergraduate in maths + CS, specializing in computer science.
  ${muted("•")} Coursework covered algorithms, systems, databases, and software engineering.
`,
      links: [],
    },
    {
      id: "epita-prepa",
      title: "CS Engineering Prep",
      org: "EPITA",
      period: "2019 — 2021",
      tags: ["prepa", "cs"],
      summary: "Two-year engineering prépa at EPITA (Le Kremlin-Bicêtre).",
      detail: () => c`
${bold(accent("Classes préparatoires d'ingénieur en informatique"))}
${accent2("EPITA")}  ${muted("·")}  ${dim("2019 — 2021")}  ${muted("·")}  ${dim("Le Kremlin-Bicêtre")}

  ${muted("•")} Two-year engineering prep program focused on computer science and mathematics.
`,
      links: [],
    },
    {
      id: "baccalaureat-oib",
      title: "Baccalauréat International OIB (Swedish) — Mention Bien",
      org: "Lycée International de Saint-Germain-en-Laye",
      period: "2019",
      tags: ["baccalaureat", "oib", "swedish"],
      summary: "International Baccalaureate, Swedish section, with honors (Mention Bien).",
      detail: () => c`
${bold(accent("Baccalauréat International OIB — Swedish section"))}
${accent2("Lycée International de Saint-Germain-en-Laye")}  ${muted("·")}  ${dim("2019")}

  ${muted("•")} International Baccalaureate, Swedish section.
  ${muted("•")} Graduated with honors (Mention Bien).
`,
      links: [],
    },
  ],
};
