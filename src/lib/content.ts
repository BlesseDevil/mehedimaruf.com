import { getCollection, type CollectionEntry } from "astro:content";

/**
 * Shared listing helpers for projects and blog posts.
 *
 * Everything sorts by the explicit `date` / `updated` frontmatter field, never
 * by file timestamps — git does not preserve those, so a fresh clone would
 * reorder the whole site.
 */

/** Drafts are visible while writing locally and never in a build. */
const live = <T extends { data: { draft: boolean } }>(entries: T[]) =>
  import.meta.env.DEV ? entries : entries.filter((entry) => !entry.data.draft);

export async function getProjects() {
  const projects = live(await getCollection("projects"));
  return projects.sort(
    (a, b) =>
      (b.data.updated ?? b.data.date).valueOf() - (a.data.updated ?? a.data.date).valueOf(),
  );
}

export async function getPosts() {
  const posts = live(await getCollection("blog"));
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Posts that live on this site (an `external` post links out instead). */
export const isLocalPost = (post: CollectionEntry<"blog">) => !post.data.external;

export const postHref = (post: CollectionEntry<"blog">) =>
  post.data.external?.url ?? `/blog/${post.id}`;

/** Human labels for the project `type` enum, used on cards and filters. */
export const TYPE_LABELS: Record<CollectionEntry<"projects">["data"]["type"], string> = {
  "windows-app": "Windows app",
  "web-tool": "Web tool",
  userscript: "Userscript",
  android: "Android",
  library: "Library",
  event: "Event",
  research: "Research",
  operations: "Operations",
};

export const BAND_LABELS = {
  software: "Software",
  irl: "In the world",
} as const;

/** Rough reading time from the raw Markdown. 200 words a minute reads honestly. */
export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export const formatDate = (value: Date) =>
  value.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const formatMonth = (value: Date) =>
  value.toLocaleDateString("en-GB", { month: "short", year: "numeric" });

/** All tags in use, most frequent first, for the blog's tag list. */
export function collectTags(posts: CollectionEntry<"blog">[]) {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag, count]) => ({ tag, count, slug: tagSlug(tag) }));
}

export const tagSlug = (tag: string) =>
  tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
