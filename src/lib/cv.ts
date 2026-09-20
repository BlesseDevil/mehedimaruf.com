/**
 * Period handling for CV entries.
 *
 * Entries write dates as "2025-03", "2025" or "present" — whichever they
 * actually know. These helpers turn that into something sortable and something
 * readable, so no entry has to carry a pre-formatted date string.
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "present" sorts above every real date. A bare year takes the edge that flatters it. */
export function sortKey(point: string, edge: "start" | "end" = "start"): number {
  if (point === "present") return 999912;
  const [year, month] = point.split("-");
  if (month) return Number(year) * 100 + Number(month);
  return Number(year) * 100 + (edge === "start" ? 1 : 12);
}

export function formatPoint(point: string): string {
  if (point === "present") return "Present";
  const [year, month] = point.split("-");
  if (!month) return year;
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** "Jan 2025 — Sep 2025", "2023 — 2024", "2025 — Present", or just "2022". */
export function formatRange(start: string, end: string): string {
  if (start === end) return formatPoint(start);
  return `${formatPoint(start)} — ${formatPoint(end)}`;
}

type Dated = { data: { start?: string; end?: string; year?: string; date?: string; order?: number } };

/**
 * Newest first. An explicit `order` wins over dates, for the cases where the
 * chronology is not the order you want to be read in.
 */
export function byRecency<T extends Dated>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    if (a.data.order !== undefined || b.data.order !== undefined) {
      return (a.data.order ?? Number.MAX_SAFE_INTEGER) - (b.data.order ?? Number.MAX_SAFE_INTEGER);
    }
    const point = (e: Dated, edge: "start" | "end") =>
      sortKey(e.data.end ?? e.data.year ?? e.data.date ?? e.data.start ?? "1900", edge);
    return point(b, "end") - point(a, "end");
  });
}

/** The résumé shows only entries flagged `resume: true`; the CV shows all. */
export function forView<T extends { data: { resume: boolean } }>(
  entries: T[],
  view: "resume" | "cv",
): T[] {
  return view === "cv" ? entries : entries.filter((e) => e.data.resume);
}
