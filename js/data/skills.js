/**
 * Skills — grouped. Rendered as a multi-group table by the msf `show` command
 * when currentModule = "skills".
 *
 * Levels: "expert" | "advanced" | "proficient" | "familiar"
 */

export const skills = {
  id: "skills",
  label: "Skills",
  groups: [
    {
      label: "Cybersecurity",
      items: [
        { name: "Vulnerability analysis",    level: "advanced" },
        { name: "MITRE ATT&CK",              level: "advanced" },
        { name: "Threat modeling",           level: "proficient" },
        { name: "Attack-path modeling",      level: "proficient" },
        { name: "Web pentesting",            level: "proficient" },
        { name: "OSINT",                     level: "proficient" },
        { name: "CVE watch & automation",    level: "proficient" },
      ],
    },
    {
      label: "Tooling",
      items: [
        { name: "Nmap",                      level: "proficient" },
        { name: "Burp Suite",                level: "proficient" },
        { name: "Wireshark",                 level: "proficient" },
        { name: "Metasploit",                level: "proficient" },
        { name: "recon-ng",                  level: "proficient" },
        { name: "Scrapy / Selenium",         level: "proficient" },
        { name: "Wazuh (SOC)",               level: "familiar" },
      ],
    },
    {
      label: "Programming",
      items: [
        { name: "Python",                    level: "advanced" },
        { name: "Java",                      level: "proficient" },
        { name: "C",                         level: "proficient" },
        { name: "JavaScript",                level: "proficient" },
        { name: "C#",                        level: "familiar" },
        { name: "PHP",                       level: "familiar" },
        { name: "Rust",                      level: "familiar" },
        { name: "TypeScript",                level: "familiar" },
      ],
    },
    {
      label: "Web & Data",
      items: [
        { name: "HTML / CSS",                level: "proficient" },
        { name: "SQL / databases",           level: "proficient" },
        { name: "DBMS internals",            level: "proficient" },
        { name: "NoSQL",                     level: "familiar" },
      ],
    },
    {
      label: "Spoken languages",
      items: [
        { name: "French",                    level: "expert" },
        { name: "Swedish",                   level: "expert" },
        { name: "English (C2)",              level: "expert" },
        { name: "Spanish",                   level: "familiar" },
        { name: "Japanese",                  level: "familiar" },
      ],
    },
  ],
};
