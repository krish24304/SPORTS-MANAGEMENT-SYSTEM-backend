const DEFAULT_COLLEGE_DOMAIN = "@xyzuniversity.ac.in";

export function normalizeCollegeId(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function isValidCollegeId(value: unknown): boolean {
  const collegeId = normalizeCollegeId(value);

  if (!collegeId) {
    return false;
  }

  return /^[a-z0-9._-]+@xyzuniversity\.ac\.in$/.test(collegeId);
}

export const COLLEGE_EMAIL_DOMAIN = DEFAULT_COLLEGE_DOMAIN;