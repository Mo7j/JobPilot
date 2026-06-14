import { useEffect, useRef, useState } from 'react';
import { Upload, Sparkles, FileText, Briefcase, CheckCircle2, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import { analyzeATS } from '../../lib/ats';
import { extractResumeText } from './extractText';
import { dataSource } from '../../data';
import { useDocument } from '../../hooks/useDocument';
import { cn } from '../../lib/utils';

function scoreColor(score) {
  if (score >= 70) return 'text-success';
  if (score >= 45) return 'text-warn';
  return 'text-danger';
}

function barColor(score) {
  if (score >= 70) return 'bg-success';
  if (score >= 45) return 'bg-warn';
  return 'bg-danger';
}

function ScoreRing({ score }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const stroke =
    score >= 70 ? 'var(--success)' : score >= 45 ? 'var(--warn)' : 'var(--danger)';
  return (
    <div className="relative grid size-24 shrink-0 place-items-center">
      <svg className="size-24 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--accent-soft)" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * score) / 100}
          style={{ transition: 'stroke-dashoffset 0.7s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn('font-display text-2xl font-bold leading-none', scoreColor(score))}>{score}</span>
        <span className="text-[0.6rem] font-semibold text-faint">/ 100</span>
      </div>
    </div>
  );
}

function DimensionBar({ label, score, note }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-ink">{label}</span>
        <span className={cn('font-bold tabular-nums', scoreColor(score))}>{score}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-accent-soft">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      {note && <p className="mt-1 text-[0.7rem] leading-snug text-muted">{note}</p>}
    </div>
  );
}

const PRIORITY_STYLES = {
  high: { dot: 'bg-danger', label: 'High', cls: 'text-danger' },
  medium: { dot: 'bg-warn', label: 'Medium', cls: 'text-warn' },
  low: { dot: 'bg-accent', label: 'Low', cls: 'text-accent-ink' },
};

export default function AtsChecker() {
  const { doc: saved } = useDocument('meta', 'ats');
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInput = useRef(null);
  const loadedFromSaved = useRef(false);

  // Pre-fill from the saved resume once it arrives.
  useEffect(() => {
    if (loadedFromSaved.current || !saved?.resumeText) return;
    loadedFromSaved.current = true;
    setResumeText(saved.resumeText);
    setResumeFileName(saved.resumeFileName || 'saved resume');
  }, [saved]);

  async function processFile(file) {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const text = await extractResumeText(file);
      setResumeText(text);
      setResumeFileName(file.name);
      await dataSource.setDoc('meta', 'ats', { resumeText: text, resumeFileName: file.name });
    } catch (err) {
      setError(err.message || 'Could not read that file.');
    } finally {
      setBusy(false);
    }
  }

  function handleFile(e) {
    processFile(e.target.files?.[0]);
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    processFile(e.dataTransfer.files?.[0]);
  }

  function runAnalysis() {
    setError('');
    const analysis = analyzeATS(jobDesc, resumeText);
    if (!analysis) {
      setError('Paste both a job description and a resume first.');
      return;
    }
    setResult(analysis);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <div className="card flex flex-col p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="flex items-center gap-1.5 text-sm font-bold">
                <FileText size={15} className="text-accent" /> Your resume
              </h3>
              <p className="mt-1 text-xs text-muted">Upload, drop, or paste your resume.</p>
            </div>
            <button
              type="button"
              aria-label="Upload PDF / DOCX / TXT"
              title="Upload PDF / DOCX / TXT"
              className="btn-soft shrink-0 text-xs"
              disabled={busy}
              onClick={() => fileInput.current?.click()}
            >
              <Upload size={14} /> {busy ? 'Reading…' : 'Upload'}
            </button>
          </div>
          {resumeFileName && <p className="mt-2 truncate text-xs text-muted">{resumeFileName}</p>}
          <input ref={fileInput} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFile} />
          <div
            className="relative mt-3 flex-1"
            onDragOver={(e) => {
              e.preventDefault();
              if (!dragActive) setDragActive(true);
            }}
            onDragLeave={(e) => {
              if (e.currentTarget.contains(e.relatedTarget)) return;
              setDragActive(false);
            }}
            onDrop={handleDrop}
          >
            <textarea
              className={cn(
                'input h-full min-h-40 resize-y text-xs transition-colors',
                dragActive && '!border-accent ring-2 ring-accent/40',
              )}
              placeholder="…or paste your resume text here"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            {dragActive && (
              <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-xl border-2 border-dashed border-accent bg-accent-soft/75 backdrop-blur-[1px]">
                <p className="flex items-center gap-2 text-sm font-bold text-accent-ink">
                  <Upload size={16} /> Drop your CV to upload
                </p>
              </div>
            )}
            {!resumeText && !dragActive && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 pt-6 text-center">
                <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-accent">
                  <Upload size={20} />
                </span>
                <p className="text-sm font-semibold text-ink">Drag &amp; drop your CV here</p>
                <p className="text-xs text-faint">PDF, DOCX, or TXT files</p>
              </div>
            )}
          </div>
        </div>

        <div className="card flex flex-col p-5">
          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-bold">
              <Briefcase size={15} className="text-accent" /> Job description
            </h3>
            <p className="mt-1 text-xs text-muted">Paste the job posting you're applying to.</p>
          </div>
          <textarea
            className="input mt-3 min-h-40 flex-1 resize-y text-xs"
            placeholder="Paste the job posting text"
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-danger-soft px-4 py-3 text-xs font-semibold text-danger">{error}</p>
      )}

      <button type="button" className="btn-primary self-start" onClick={runAnalysis}>
        <Sparkles size={15} /> Check match
      </button>

      {result && (
        <div className="anim-rise flex flex-col gap-4">
          {/* Score + dimension breakdown */}
          <div className="card grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center">
            <div className="flex items-center gap-4">
              <ScoreRing score={result.score} />
              <div>
                <p className={cn('font-display text-lg font-bold', scoreColor(result.score))}>
                  {result.verdict}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {result.stats.skillsMatched}/{result.stats.skillsRequired} required skills matched
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {result.dimensions.map((d) => (
                <DimensionBar key={d.key} label={d.label} score={d.score} note={d.note} />
              ))}
            </div>
          </div>

          {/* Skills coverage */}
          <div className="card p-6">
            <h3 className="flex items-center gap-1.5 text-sm font-bold">
              <TrendingUp size={15} className="text-accent" /> Skills coverage
            </h3>

            {result.matchedGroups.length > 0 && (
              <div className="mt-4">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-success">
                  <CheckCircle2 size={13} /> Matched ({result.matched.length})
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {result.matchedGroups.map((g) => (
                    <div key={g.category} className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-1.5">
                      <span className="shrink-0 text-[0.7rem] font-semibold text-faint sm:w-24">{g.label}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {g.items.map((k) => (
                          <span key={k} className="chip bg-success-soft text-success">{k}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.missingGroups.length > 0 && (
              <div className="mt-5">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-danger">
                  <AlertTriangle size={13} /> Missing ({result.missing.length})
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {result.missingGroups.map((g) => (
                    <div key={g.category} className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-1.5">
                      <span className="shrink-0 text-[0.7rem] font-semibold text-faint sm:w-24">{g.label}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {g.items.map((k) => (
                          <span key={k} className="chip bg-danger-soft text-danger">{k}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.matched.length === 0 && result.missing.length === 0 && (
              <p className="mt-3 text-xs text-muted">
                No recognised skills in the job description, paste a fuller posting for a sharper read.
              </p>
            )}

            {result.extraMissing.length > 0 && (
              <p className="mt-4 text-xs leading-relaxed text-muted">
                <span className="font-semibold text-ink">Also repeated in the posting:</span>{' '}
                {result.extraMissing.slice(0, 8).join(', ')}
              </p>
            )}
          </div>

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="card p-6">
              <h3 className="flex items-center gap-1.5 text-sm font-bold">
                <Lightbulb size={15} className="text-accent" /> How to improve your match
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {result.suggestions.map((s, i) => {
                  const p = PRIORITY_STYLES[s.priority] ?? PRIORITY_STYLES.low;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', p.dot)} />
                      <p className="text-xs leading-relaxed text-ink">
                        <span className={cn('mr-1.5 font-bold uppercase tracking-wide', p.cls)}>
                          {p.label}
                        </span>
                        {s.text}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 border-t border-accent-soft pt-3 text-[0.7rem] leading-relaxed text-faint">
                Tailor honestly, ATS filters match words, but a human reads next. Only claim what's true.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
