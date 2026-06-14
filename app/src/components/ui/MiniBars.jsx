import { useState } from 'react';
import { cn } from '../../lib/utils';

export default function MiniBars({
  data,
  title,
  valueSuffix = '',
  className,
  barClassName = 'bg-accent',
}) {
  const [activeIndex, setActiveIndex] = useState(null);
  const max = Math.max(1, ...data.map((item) => item.value ?? 0));
  const total = data.reduce((sum, item) => sum + (item.value ?? 0), 0);
  const activeValue = activeIndex == null ? null : data[activeIndex]?.value;

  return (
    <div
      className={cn('group flex flex-col rounded-2xl border border-line bg-card/70 p-4 transition-colors', className)}
      onMouseLeave={() => setActiveIndex(null)}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('size-2 rounded-full', barClassName)} />
          <span className="text-xs font-bold uppercase tracking-wide text-faint">{title}</span>
        </div>
        <span className="text-xs font-semibold tabular-nums text-faint">
          {activeValue == null ? `${total}${valueSuffix} total` : `${activeValue}${valueSuffix}`}
        </span>
      </div>

      <div className="flex min-h-28 flex-1 items-end gap-1.5">
        {data.map((item, index) => {
          const value = item.value ?? 0;
          const isActive = activeIndex === index;
          const isDimmed = activeIndex != null && !isActive;
          const isEmpty = value === 0;
          const height = Math.max(6, (value / max) * 90);

          return (
            <button
              type="button"
              key={item.id ?? `${item.label}-${index}`}
              className="flex h-full flex-1 cursor-default flex-col items-center focus:outline-none"
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(null)}
              aria-label={`${item.label}: ${value}${valueSuffix}`}
            >
              <div className="flex w-full flex-1 flex-col items-center justify-end gap-1.5">
                <span
                  className={cn(
                    'text-[11px] font-bold leading-none tabular-nums transition-colors',
                    isEmpty ? 'text-faint/55' : isActive ? 'text-ink' : 'text-muted',
                  )}
                >
                  {value}
                </span>
                <div
                  className={cn(
                    'w-full max-w-9 rounded-lg transition-all duration-200',
                    isEmpty ? 'bg-ink/10 dark:bg-ink/15' : barClassName,
                    !isEmpty && (isDimmed ? 'opacity-40' : isActive ? 'opacity-100' : 'opacity-85'),
                    isActive && !isEmpty && 'shadow-[0_4px_14px_-4px_currentColor]',
                  )}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span
                className={cn(
                  'mt-2 max-w-full truncate text-[10px] font-semibold leading-none transition-colors',
                  isActive ? 'text-ink' : 'text-faint',
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
