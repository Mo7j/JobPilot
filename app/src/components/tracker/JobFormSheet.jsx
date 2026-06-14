import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { dataSource } from '../../data';
import { toDate } from '../../lib/dates';

export const TRACKER_STATUSES = [
  { id: 'pending', label: 'Pending', tone: 'bg-amber-soft text-amber-ink' },
  { id: 'assessments', label: 'Assessment', tone: 'bg-accent-soft text-accent-ink' },
  { id: 'interview', label: 'Interview', tone: 'bg-info-soft text-info' },
  { id: 'offer', label: 'Offer', tone: 'bg-success-soft text-success' },
  { id: 'rejected', label: 'Rejected', tone: 'bg-danger-soft text-danger' },
];

const EMPTY = {
  companyName: '',
  position: '',
  location: '',
  status: 'pending',
  dateApplied: '',
  followUpDate: '',
  jobUrl: '',
  contactName: '',
  contactEmail: '',
  notes: '',
};

function toInputDate(value) {
  const d = toDate(value);
  return d && !isNaN(d) ? d.toISOString().slice(0, 10) : '';
}

export default function JobFormSheet({ open, job, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        job
          ? {
              ...EMPTY,
              ...job,
              dateApplied: toInputDate(job.dateApplied),
              followUpDate: toInputDate(job.followUpDate),
            }
          : EMPTY,
      );
    }
  }, [open, job]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const data = {
        ...form,
        dateApplied: form.dateApplied ? new Date(form.dateApplied).toISOString() : null,
        followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : null,
      };
      delete data.id;
      if (job?.id) await dataSource.updateDoc('jobs', job.id, data);
      else await dataSource.addDoc('jobs', data);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!job?.id || busy) return;
    setBusy(true);
    try {
      await dataSource.deleteDoc('jobs', job.id);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close form"
            className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center pointer-events-none">
            <motion.div
              className="pointer-events-auto w-full max-w-lg rounded-t-3xl border border-line bg-card shadow-2xl lg:rounded-3xl"
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 48, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
            <form onSubmit={save} className="max-h-[85dvh] overflow-y-auto p-6 flex flex-col gap-4">
              <header className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">
                  {job ? 'Edit application' : 'Track an application'}
                </h2>
                <button type="button" onClick={onClose} className="btn-ghost !p-2" aria-label="Close">
                  <X size={16} />
                </button>
              </header>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="label">Company *</label>
                  <input className="input" required value={form.companyName} onChange={set('companyName')} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="label">Position *</label>
                  <input className="input" required value={form.position} onChange={set('position')} />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input className="input" value={form.location} onChange={set('location')} />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={form.status} onChange={set('status')}>
                    {TRACKER_STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Applied on</label>
                  <input type="date" className="input" value={form.dateApplied} onChange={set('dateApplied')} />
                </div>
                <div>
                  <label className="label">Follow up on</label>
                  <input type="date" className="input" value={form.followUpDate} onChange={set('followUpDate')} />
                </div>
                <div className="col-span-2">
                  <label className="label">Job URL</label>
                  <input type="url" className="input" placeholder="https://…" value={form.jobUrl} onChange={set('jobUrl')} />
                </div>
                <div>
                  <label className="label">Contact name</label>
                  <input className="input" value={form.contactName} onChange={set('contactName')} />
                </div>
                <div>
                  <label className="label">Contact email</label>
                  <input type="email" className="input" value={form.contactEmail} onChange={set('contactEmail')} />
                </div>
                <div className="col-span-2">
                  <label className="label">Notes</label>
                  <textarea className="input min-h-20 resize-y" value={form.notes} onChange={set('notes')} />
                </div>
              </div>

              <footer className="flex items-center gap-2 pt-1">
                <button type="submit" className="btn-primary !shadow-[0_2px_8px_-5px_color-mix(in_srgb,var(--accent)_45%,transparent)]" disabled={busy}>
                  {job ? 'Save changes' : 'Add application'}
                </button>
                <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
                {job && (
                  <button
                    type="button"
                    className="btn-danger-soft ml-auto !px-3"
                    disabled={busy}
                    onClick={remove}
                    aria-label="Delete application"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </footer>
            </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
