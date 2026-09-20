import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z, type ZodRawShape } from "astro/zod";

/**
 * Content collections — the "drop a file in and it appears" model.
 *
 * Every entry is a Markdown file in a folder. Add one, and it shows up on the
 * site, sorted by its own frontmatter. Files whose names start with `_` are
 * ignored, which is how the `_template.md` in each folder stays invisible.
 *
 * See CONTENT-GUIDE.md for the same thing in plain language.
 */

/** "2025-03", "2025" or "present" — enough to sort and to display. */
const periodPoint = z
  .string()
  .regex(/^(\d{4}(-\d{2})?|present)$/, 'Use "YYYY", "YYYY-MM" or "present".');

/** Shared by every CV entry: does the short résumé include this one? */
const cvBase = {
  /** true = also appears on /resume. The full /cv always shows everything. */
  resume: z.boolean().default(false),
  /** Optional manual nudge when date order is not the order you want. */
  order: z.number().optional(),
};

const cvCollection = <S extends ZodRawShape>(folder: string, schema: S) =>
  defineCollection({
    loader: glob({ pattern: "**/[^_]*.md", base: `./src/content/cv/${folder}` }),
    schema: z.object({ ...cvBase, ...schema }),
  });

const experience = cvCollection("experience", {
  role: z.string(),
  org: z.string(),
  orgUrl: z.string().url().optional(),
  location: z.string().optional(),
  start: periodPoint,
  end: periodPoint,
  /** Short skill chips shown under the entry. */
  tags: z.array(z.string()).default([]),
});

const education = cvCollection("education", {
  degree: z.string(),
  institution: z.string(),
  /** e.g. "CGPA 3.30 / 4.00" — omit anything you would rather not publish. */
  detail: z.string().optional(),
  end: periodPoint,
});

const research = cvCollection("research", {
  title: z.string(),
  role: z.string().optional(),
  venue: z.string().optional(),
  year: periodPoint,
  url: z.string().url().optional(),
});

const training = cvCollection("training", {
  title: z.string(),
  org: z.string(),
  date: periodPoint,
  detail: z.string().optional(),
});

const awards = cvCollection("awards", {
  title: z.string(),
  year: periodPoint,
  detail: z.string().optional(),
  /** "scholarship" | "competition" — groups the list into bands. */
  kind: z.enum(["scholarship", "competition", "distinction"]).default("distinction"),
});

const volunteer = cvCollection("volunteer", {
  role: z.string(),
  org: z.string(),
  start: periodPoint,
  end: periodPoint,
});

const community = cvCollection("community", {
  title: z.string(),
  start: periodPoint.optional(),
  end: periodPoint.optional(),
});

/**
 * Projects. `band` decides which half of /projects it lands in:
 *   software — things with code (Windows apps, web tools, userscripts, Android)
 *   irl      — delivery work (events, research, relief operations)
 * IRL entries need no repo: text and images are enough.
 */
const projects = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      band: z.enum(["software", "irl"]),
      type: z.enum([
        "windows-app",
        "web-tool",
        "userscript",
        "android",
        "library",
        "event",
        "research",
        "operations",
      ]),
      /** Sorting key for listings and the "Recently" strip. */
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      period: z.string().optional(),
      repo: z.string().url().optional(),
      releaseUrl: z.string().url().optional(),
      installUrl: z.string().url().optional(),
      demoUrl: z.string().url().optional(),
      /** Shows a "source private" badge instead of a repo link. */
      sourcePrivate: z.boolean().default(false),
      stack: z.array(z.string()).default([]),
      cover: image().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

/**
 * Blog. An `external` entry is one published somewhere else: it appears in the
 * list with the publication's name and links straight out, with no local page.
 */
const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      /** Sets the lang attribute and the Bangla font on the article. */
      lang: z.enum(["en", "bn"]).default("en"),
      cover: image().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      external: z
        .object({
          url: z.string().url(),
          publication: z.string(),
        })
        .optional(),
    }),
});

export const collections = {
  experience,
  education,
  research,
  training,
  awards,
  volunteer,
  community,
  projects,
  blog,
};
