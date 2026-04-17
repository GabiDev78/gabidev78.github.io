/**
 * Professional experience.
 * Schema: { id, title, org, period, tags[], summary, detail(), links[] }
 */

import { c, accent, accent2, bold, dim, muted } from "../render.js";

export const experience = {
  id: "experience",
  label: "Experience",
  modules: [
    {
      id: "thales-las",
      title: "Apprentice Cybersecurity Engineer",
      org: "Thales LAS",
      period: "2024 — 2026",
      location: "Rungis, France",
      tags: ["cyber", "vuln-mgmt", "threat-modeling", "pentest", "python"],
      summary: "Vuln watch, threat / attack-path modeling, internal pentests, Python automation.",
      detail: () => c`
${bold(accent("Apprentice Cybersecurity Engineer"))} @ ${accent2("Thales LAS")}
${dim("2024 — 2026")}  ${muted("·")}  ${dim("Rungis, France")}

  ${muted("•")} CVE watch across CERTs, NVD, and e-santé feeds; triage and vulnerability analysis.
  ${muted("•")} Threat modeling and attack-path modeling on embedded and enterprise systems.
  ${muted("•")} Applied frameworks: MITRE ATT&CK, NIST, Cyber Kill Chain.
  ${muted("•")} Internal pentesting engagements and remediation tracking.
  ${muted("•")} Client-facing project management on cybersecurity deliverables.
  ${muted("•")} Python scripting and automation for the security team; R&D work on tooling.

${dim("stack:")} Python, MITRE ATT&CK, NIST, CVE/NVD, pentest tooling
`,
      links: [],
    },
    {
      id: "paris-cite-tutor",
      title: "CS Project Tutor — Licence 2/3",
      org: "Université Paris Descartes",
      period: "2026",
      location: "Paris, France",
      tags: ["teaching", "mentoring"],
      summary: "Tutoring undergraduate CS students through their project coursework.",
      detail: () => c`
${bold(accent("CS Project Tutor — Licence 2/3"))} @ ${accent2("Université Paris Descartes")}
${dim("2026")}  ${muted("·")}  ${dim("Paris, France")}

  ${muted("•")} Mentoring undergraduate students (Licence 2/3) through their CS projects.
  ${muted("•")} Code review, design feedback, and unblocking on algorithms, systems, and tooling.
`,
      links: [],
    },
    {
      id: "labschool-paris",
      title: "Computer Science & Maths Teacher",
      org: "LabSchool Paris",
      period: "2023 — 2024",
      location: "Montreuil, France",
      tags: ["teaching", "cs", "maths"],
      summary: "Teaching CS and maths to secondary-school students (3ème / 2de).",
      detail: () => c`
${bold(accent("Computer Science & Maths Teacher"))} @ ${accent2("LabSchool Paris")}
${dim("2023 — 2024")}  ${muted("·")}  ${dim("Montreuil, France")}

  ${muted("•")} Teaching computer science and mathematics to 3ème / 2de students.
  ${muted("•")} Designing hands-on lessons and progress assessments.
`,
      links: [],
    },
  ],
};
