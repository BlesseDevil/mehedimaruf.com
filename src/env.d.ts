/// <reference types="astro/client" />

/** YAML content files are imported as raw strings and parsed at build time. */
declare module "*.yaml?raw" {
  const contents: string;
  export default contents;
}
