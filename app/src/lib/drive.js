// Helpers for previewing files that live in the owner's Google Drive (their
// JOBS_DIR is synced to Drive, see docs/SETUP.md § 9a). Agents save files
// locally; when a Drive link is known we can embed Google's own preview inline
// instead of bouncing the owner out to a new tab.

// Pull the Drive file ID out of the common link shapes:
//   https://drive.google.com/file/d/<ID>/view?usp=...
//   https://drive.google.com/open?id=<ID>
//   https://drive.google.com/uc?id=<ID>&...
//   https://docs.google.com/document/d/<ID>/edit
export function driveFileId(url) {
  if (!url || typeof url !== 'string') return null;
  const byPath = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (byPath) return byPath[1];
  const byQuery = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (byQuery) return byQuery[1];
  return null;
}

// A URL we can drop into an <iframe> for an inline preview, or null if this
// isn't a Drive file link (caller should fall back to opening it in a new tab).
export function toDrivePreviewUrl(url) {
  const id = driveFileId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}

export function isPreviewable(url) {
  return !!toDrivePreviewUrl(url);
}
