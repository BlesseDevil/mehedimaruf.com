import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE } from "../config";
import { getPosts, postHref } from "../lib/content";

/**
 * The feed carries external pieces too, pointing at wherever they were
 * published — a reader following this feed wants everything written, not only
 * what happens to be hosted here.
 */
export async function GET(context: APIContext) {
  const posts = await getPosts();

  return rss({
    title: `${SITE.name} — Writing`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts
      .filter((post) => !post.data.draft)
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: post.data.external ? post.data.external.url : new URL(postHref(post), SITE.url).href,
        categories: post.data.tags,
      })),
    customData: `<language>en-gb</language>`,
  });
}
