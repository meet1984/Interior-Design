/**
 * getImageUrl — Universal image URL resolver for CPanel production.
 *
 * The problem: Image paths are stored in the database as relative paths
 * like `/uploads/filename.jpg`. On the live website, we need to prefix them
 * with the correct API base URL (e.g., `https://klarehomes.com`) so the browser
 * can actually fetch the file from the backend's /uploads Express static route.
 *
 * How it works:
 * - If VITE_API_URL is set (local dev): prepend it → `http://localhost:5000/uploads/file.jpg`
 * - If VITE_API_URL is empty (production): use a relative URL → `/uploads/file.jpg`
 *   This works because in production, Express serves both the frontend (dist/) AND
 *   the /uploads static route from the same origin (klarehomes.com).
 *
 * @param {string|null} path - The path stored in DB (e.g., '/uploads/abc.jpg')
 * @param {string|null} fallback - Optional fallback image URL if path is missing
 * @returns {string} - Fully resolved image URL
 */
const BASE = import.meta.env.VITE_API_URL || '';

export const getImageUrl = (path, fallback = null) => {
  if (!path) return fallback || '';

  // Already a full external URL (http/https) — return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Relative path like /uploads/file.jpg — prepend API base
  if (path.startsWith('/')) {
    return `${BASE}${path}`;
  }

  // Bare filename or other — just prepend base + /uploads/
  return `${BASE}/uploads/${path}`;
};

export default getImageUrl;
