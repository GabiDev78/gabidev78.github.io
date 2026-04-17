/**
 * Credentials & achievements. No formal industry certs yet — CTF ranking
 * and the Charlemagne Youth Prize live here.
 */

import { c, accent, accent2, bold, dim, muted, link } from "../render.js";

export const certifications = {
  id: "certifications",
  label: "Credentials",
  modules: [
    {
      id: "rootme",
      title: "Root Me — 620 points",
      org: "Root-Me.org",
      period: "ongoing",
      tags: ["ctf", "ranking"],
      summary: "CTF / security-challenge platform. Handle: GabiDev94.",
      detail: () => c`
${bold(accent("Root Me"))}
${accent2("Root-Me.org")}  ${muted("·")}  ${dim("ongoing")}

  ${muted("•")} 620 points across web, crypto, forensics, reversing, and related tracks.
  ${muted("•")} Handle: ${accent("GabiDev94")}.

${dim("link:")} ${link("root-me.org/GabiDev94", "https://www.root-me.org/GabiDev94")}
`,
      links: [
        { label: "profile", url: "https://www.root-me.org/GabiDev94" },
      ],
    },
    {
      id: "charlemagne-prize",
      title: "Charlemagne Youth Prize — National winner",
      org: "European Parliament",
      period: "pre-2019",
      tags: ["award", "civic"],
      summary: "National winner of the Charlemagne Youth Prize for Europe (for EVRISOPS).",
      detail: () => c`
${bold(accent("Charlemagne Youth Prize for Europe"))}
${accent2("European Parliament")}

  ${muted("•")} National winner with ${bold("EVRISOPS")}, a civic application built with a small team.
  ${muted("•")} See ${accent("projects/evrisops")} for context on the project itself.
`,
      links: [],
    },
  ],
};
