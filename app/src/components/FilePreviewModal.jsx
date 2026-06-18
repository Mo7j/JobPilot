import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ExternalLink, FileText } from 'lucide-react';
import { toDrivePreviewUrl } from '../lib/drive';

/**
 * Inline file preview. When the file lives in the owner's Google Drive (their
 * synced JOBS_DIR), we embed Google's own /preview iframe so the report, CV, or
 * application screenshot opens right inside the dashboard. If we can't build a
 * Drive preview URL (e.g. only a local path is known), we show that path and a
 * button to open the raw link in a new tab.
 */
export default function FilePreviewModal({ file, onClose }) {
  const previewUrl = file ? toDrivePreviewUrl(file.url) : null;

  return createPortal(
    <AnimatePresence>
      {file && (
        <>
          <motion.button
            type="button"
            aria-label="Close preview"
            className="fixed inset-0 z-[60] bg-ink/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[61] grid place-items-center p-3 sm:p-6"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onClick={onClose}
          >
            <div
              className="flex h-full max-h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="flex items-center gap-2 border-b border-line px-4 py-3">
                <FileText size={16} className="shrink-0 text-accent" />
                <h2 className="min-w-0 flex-1 truncate text-sm font-bold">{file.label}</h2>
                {file.url && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost !px-2.5 !py-1.5 text-xs"
                  >
                    <ExternalLink size={13} /> Open
                  </a>
                )}
                <button type="button" onClick={onClose} className="btn-ghost !p-2" aria-label="Close">
                  <X size={16} />
                </button>
              </header>

              <div className="flex-1 overflow-hidden bg-card-2">
                {previewUrl ? (
                  <iframe
                    title={file.label}
                    src={previewUrl}
                    className="h-full w-full border-0"
                    allow="autoplay"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                    <FileText size={28} className="text-faint" />
                    <p className="text-sm text-muted leading-relaxed">
                      This file is saved on the machine the agents run on
                      {file.path ? (
                        <>
                          {' '}at<br />
                          <code className="mt-1 inline-block rounded bg-card px-2 py-1 text-xs">{file.path}</code>
                        </>
                      ) : (
                        '.'
                      )}
                      <br />
                      Keep your jobs folder synced to Google Drive (Setup § 9a) to preview it here.
                    </p>
                    {file.url && (
                      <a href={file.url} target="_blank" rel="noreferrer" className="btn-soft !px-3.5 !py-2 text-sm">
                        <ExternalLink size={14} /> Open in new tab
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
