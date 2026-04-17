/**
 * "about" category — single synthetic module built from profile.js.
 * Lets visitors `use about` and then `show` / `info about/me`.
 */

import { profile } from "./profile.js";
import { c, accent, accent2, bold, dim, muted } from "../render.js";

export const about = {
  id: "about",
  label: "About",
  modules: [
    {
      id: "me",
      title: profile.name,
      org: profile.tagline,
      period: profile.location || "",
      tags: ["bio"],
      summary: profile.tagline,
      detail: () => {
        const frag = document.createDocumentFragment();
        frag.appendChild(c`${bold(accent(profile.name))}  ${muted("·")}  ${accent2(profile.tagline)}`);
        frag.appendChild(document.createElement("br"));
        if (profile.location) {
          frag.appendChild(c`${dim("location:")} ${profile.location}`);
          frag.appendChild(document.createElement("br"));
        }
        frag.appendChild(document.createElement("br"));
        for (const line of profile.about) {
          frag.appendChild(c`  ${muted("•")} ${line}`);
          frag.appendChild(document.createElement("br"));
        }
        return frag;
      },
      links: [],
    },
  ],
};
