export default function EmptyState({ image = '/sitting.png', title, hint, children }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center anim-rise">
      <img src={image} alt="" className="h-28 w-auto anim-float" loading="lazy" />
      <p className="font-display font-bold">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted leading-relaxed">{hint}</p>}
      {children}
    </div>
  );
}
