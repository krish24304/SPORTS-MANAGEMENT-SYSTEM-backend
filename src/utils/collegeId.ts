const normalizeCollegeId = (value: unknown) =>
  String(value ?? "").trim().toUpperCase();

/**
 * IMPORTANT:
 * This is an allow-list, not a guessed ID-format check.
 *
 * Put the actual college-issued IDs in COLLEGE_IDS in .env.
 *
 * Example:
 * COLLEGE_IDS=CS001,CS002,SE12345
 */
const collegeIds = new Set(
  (process.env.COLLEGE_IDS ?? "")
    .split(",")
    .map(normalizeCollegeId)
    .filter(Boolean)
);

export function isValidCollegeId(value: unknown): boolean {
  const id = normalizeCollegeId(value);

  if (!id) return false;

  // Fail closed if the authoritative allow-list was not configured.
  return collegeIds.has(id);
}

export { normalizeCollegeId };