/**
 * Top-level profile data.
 *
 * Strings here are used by `whoami` (when `use about` is active),
 * `contact`, `download`, and the <noscript> fallback.
 */

export const profile = {
  name: "Gabriel Glazman",
  handle: "gabriel",
  tagline: "cybersecurity engineer · MSc candidate · apprentice @ Thales LAS",
  location: "Villejuif, France",
  pronouns: "",
  about: [
    "Finishing an MSc in Cybersecurity at Université Paris Descartes while working as an apprentice cybersecurity engineer at Thales LAS (Rungis).",
    "Day-to-day: CVE / NVD / e-santé watch, vulnerability analysis, threat and attack-path modeling, internal pentests, and Python automation for the security team.",
    "Side projects span CNN-based malware detection, AI-driven CVE → MITRE ATT&CK mapping, a from-scratch DBMS, and a civic app that won the national Charlemagne Youth Prize.",
    "Trilingual (French · Swedish · English C2), with academic Spanish and Japanese.",
  ],
  contact: {
    email: "gabriel@glazman.org",
    phone: "+33 6 82 56 16 73",
    rootme: "https://www.root-me.org/GabiDev94",
    linkedin: "https://www.linkedin.com/in/gabriel-glazman-04b7292b2/"
    // github / linkedin: add when ready
  },
  cv: {
    // Path served from assets/cv.pdf (drop the real PDF there).
    pdfUrl: "./assets/cv.pdf",
    lastUpdated: "2026-04",
  },
  versionTagline: "v1.0 — cybersecurity portfolio",
};
