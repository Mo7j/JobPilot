import { useState } from 'react';
import { FileText, Eye } from 'lucide-react';
import FilePreviewModal from './FilePreviewModal';

/**
 * Renders a jobCase's files (from lib/pipeline `jobFiles`) as chips that open an
 * inline preview. Drive-backed files preview in an embedded Google Drive iframe;
 * local-only files show their path with an open-in-new-tab fallback.
 */
export default function FileLinks({ files }) {
  const [active, setActive] = useState(null);
  if (!files?.length) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {files.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActive(f)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card-2 px-3 py-1.5 text-xs font-semibold transition-colors hover:border-accent/40 hover:bg-accent-soft hover:text-accent-ink"
          >
            <FileText size={13} />
            {f.label}
            <Eye size={12} className="opacity-60" />
          </button>
        ))}
      </div>
      <FilePreviewModal file={active} onClose={() => setActive(null)} />
    </>
  );
}
