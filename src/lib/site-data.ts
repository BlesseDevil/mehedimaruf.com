import { parse } from "yaml";
import { z } from "astro/zod";
// `?raw` hands the file contents to the bundler, so these resolve identically in
// dev and in a production build. Reading them from disk at render time does not:
// the built module lives somewhere else entirely.
import profileYaml from "../content/cv/profile.yaml?raw";
import skillsYaml from "../content/cv/skills.yaml?raw";

/**
 * profile.yaml and skills.yaml are read here rather than through a content
 * collection: they are single documents, not folders of entries, and YAML with
 * comments is the friendliest thing to hand-edit.
 *
 * They are validated on every build, so a typo fails the build with a readable
 * message instead of rendering a blank section.
 */

const sources: Record<string, string> = {
  "profile.yaml": profileYaml,
  "skills.yaml": skillsYaml,
};

const read = (name: string) => parse(sources[name]!);

const profileSchema = z.object({
  name: z.string(),
  positioning: z.array(z.string()).default([]),
  role: z.string(),
  motto: z.string().default(""),
  location: z.string().optional(),
  about: z.string(),
  proofPoints: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .default([]),
  languages: z.array(z.object({ name: z.string(), level: z.string() })).default([]),
  links: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
});

const skillsSchema = z.object({
  groups: z
    .array(
      z.object({
        name: z.string(),
        resume: z.boolean().default(false),
        items: z.array(z.string()),
      }),
    )
    .default([]),
});

function validate<T>(schema: z.ZodType<T>, data: unknown, file: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const problems = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`${file} is not valid:\n${problems}`);
  }
  return result.data;
}

export const profile = validate(profileSchema, read("profile.yaml"), "profile.yaml");
export const skills = validate(skillsSchema, read("skills.yaml"), "skills.yaml");

export type Profile = typeof profile;
export type Skills = typeof skills;
