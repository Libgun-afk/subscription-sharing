"use client";

import { useId, useMemo, useRef, useState } from "react";

type Size = "sm" | "md" | "lg";

export type StarRatingProps = {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  disabled?: boolean;
  size?: Size;
  className?: string;
  ariaLabel?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function toStepInt(n: number) {
  return clamp(Math.round(n), 0, 5);
}

function StarIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.156c.969 0 1.371 1.24.588 1.81l-3.362 2.443a1 1 0 00-.364 1.118l1.286 3.953c.3.921-.755 1.688-1.539 1.118l-3.362-2.443a1 1 0 00-1.176 0l-3.362 2.443c-.783.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.27 9.38c-.783-.57-.38-1.81.588-1.81h4.156a1 1 0 00.95-.69l1.286-3.953z" />
    </svg>
  );
}

function sizeClasses(size: Size) {
  switch (size) {
    case "sm":
      return "h-4 w-4";
    case "lg":
      return "h-6 w-6";
    default:
      return "h-5 w-5";
  }
}

function ReadOnlyStar({ fraction, size }: { fraction: number; size: Size }) {
  const w = `${Math.round(clamp(fraction, 0, 1) * 100)}%`;
  const base = sizeClasses(size);
  return (
    <span className="relative inline-block">
      <StarIcon className={`${base} text-slate-200 dark:text-slate-800`} />
      <span className="absolute inset-0 overflow-hidden" style={{ width: w }}>
        <StarIcon className={`${base} text-amber-400`} />
      </span>
    </span>
  );
}

export function StarRating({
  value,
  defaultValue = 0,
  onChange,
  readOnly = false,
  disabled = false,
  size = "md",
  className,
  ariaLabel = "Rating",
}: StarRatingProps) {
  const uid = useId();
  const isControlled = value != null;
  const [internalValue, setInternalValue] = useState(() => clamp(defaultValue, 0, 5));
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const currentValue = clamp(isControlled ? (value as number) : internalValue, 0, 5);
  const interactive = !readOnly && !disabled && typeof onChange === "function";

  const activeValue = interactive && hoverValue != null ? hoverValue : currentValue;
  const selectedInt = useMemo(() => toStepInt(currentValue), [currentValue]);

  function commit(next: number) {
    const v = clamp(next, 0, 5);
    if (!interactive) return;
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
  }

  function focusStar(index: number) {
    const el = buttonsRef.current[index];
    el?.focus();
  }

  if (!interactive) {
    const display = clamp(currentValue, 0, 5);
    return (
      <div
        className={["inline-flex items-center gap-1", className].filter(Boolean).join(" ")}
        aria-label={`${ariaLabel}: ${display.toFixed(1)} out of 5`}
        role="img"
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const frac = clamp(display - i, 0, 1);
          return <ReadOnlyStar key={i} fraction={frac} size={size} />;
        })}
        <span className="sr-only">{`${ariaLabel}: ${display.toFixed(1)} out of 5`}</span>
      </div>
    );
  }

  const starSize = sizeClasses(size);
  const groupId = `rating-${uid}`;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={["inline-flex items-center gap-1", className].filter(Boolean).join(" ")}
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const checked = selectedInt === starValue;
        const filled = activeValue >= starValue;

        return (
          <button
            key={starValue}
            ref={(el) => {
              buttonsRef.current[i] = el;
            }}
            type="button"
            role="radio"
            name={groupId}
            aria-checked={checked}
            aria-label={`Set rating to ${starValue} out of 5`}
            tabIndex={checked || (selectedInt === 0 && starValue === 1) ? 0 : -1}
            onMouseEnter={() => setHoverValue(starValue)}
            onFocus={() => setHoverValue(starValue)}
            onBlur={() => setHoverValue(null)}
            onClick={() => commit(starValue)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                const next = clamp(selectedInt + 1, 1, 5);
                commit(next);
                focusStar(next - 1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                const next = clamp(selectedInt - 1, 1, 5);
                commit(next);
                focusStar(next - 1);
              } else if (e.key === "Home") {
                e.preventDefault();
                commit(1);
                focusStar(0);
              } else if (e.key === "End") {
                e.preventDefault();
                commit(5);
                focusStar(4);
              } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                commit(starValue);
              }
            }}
            className={[
              "group inline-flex items-center justify-center rounded-md p-1 transition",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))]",
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
            ].join(" ")}
          >
            <StarIcon
              className={[
                starSize,
                "transition-transform duration-150 ease-out group-hover:scale-110",
                filled ? "text-amber-400" : "text-slate-200 dark:text-slate-800",
              ].join(" ")}
            />
          </button>
        );
      })}
    </div>
  );
}

