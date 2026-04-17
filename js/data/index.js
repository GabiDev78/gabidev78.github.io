/**
 * Central data export. Order here determines the order in `show` at root.
 */

import { about } from "./about.js";
import { experience } from "./experience.js";
import { education } from "./education.js";
import { skills } from "./skills.js";
import { projects } from "./projects.js";
import { certifications } from "./certifications.js";

export const CATEGORIES = [about, experience, education, skills, projects, certifications];
