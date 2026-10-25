/**
 * Inline stroke icons on a 24px grid.
 *
 * Inline SVG rather than an icon font or an <img>: they inherit `currentColor`,
 * they cost no extra request, and they stay crisp at any size. Decorative ones
 * are aria-hidden so a screen reader announces the button's label, not a shape.
 */

type IconProps = {
  className?: string;
  size?: number;
};

function base(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

export function SearchIcon({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={1.8}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}

export function SlidersIcon({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={1.8}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

export function GlobeIcon({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={1.7}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9Z" />
    </svg>
  );
}

export function ChevronDownIcon({ className, size = 12 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={2.4}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CloseIcon({ className, size = 12 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={2.6}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function CheckIcon({ className, size = 14 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={2.6}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function ChevronLeftIcon({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={2.2}>
      <path d="m14 6-6 6 6 6" />
    </svg>
  );
}

export function PaletteIcon({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={1.7}>
      <path d="M12 3a9 9 0 0 0 0 18c1 0 1.7-.8 1.7-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.6 1.7-1.6H16a5 5 0 0 0 5-5c0-4-4-7.3-9-7.3Z" />
      <circle cx="7.5" cy="11.5" r="1" />
      <circle cx="10.5" cy="7.5" r="1" />
      <circle cx="15" cy="8.5" r="1" />
    </svg>
  );
}

export function InfoIcon({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 7.6v.4" />
    </svg>
  );
}

export function LeafIcon({ className, size = 12 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={2}>
      <path d="M12 21C5 16 5 8 12 3c7 5 7 13 0 18Z" />
    </svg>
  );
}

export function FlameIcon({ className, size = 12 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={2}>
      <path d="M12 22c4-2 6-5 6-8 0-4-3-5-3-9-3 2-4 4-4 6-2-1-2-3-2-3-2 2-3 4-3 6 0 3 2 6 6 8Z" />
    </svg>
  );
}

/** The brand mark: fork and spoon. */
export function MarkIcon({ className, size = 20 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={1.6}>
      <path d="M7 3v8a3 3 0 0 0 6 0V3" />
      <path d="M10 11v10" />
      <path d="M17 3c0 4-2 5-2 8h4c0-3-2-4-2-8Z" />
      <path d="M17 11v10" />
    </svg>
  );
}

/**
 * Stand-in artwork for a dish with no photo yet. A quiet abstract plate reads
 * as "no photo" without shouting; a broken-image icon or a grey box both look
 * like a bug to a diner.
 */
export function PlatePlaceholder({ className, variant = 0 }: { className?: string; variant?: number }) {
  const shapes = [
    <g key="0">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.4" />
    </g>,
    <g key="1">
      <path d="M4 14h16a8 8 0 0 1-16 0Z" />
      <path d="M3 18h18" />
      <path d="M9 10c0-2 1-3 3-4" />
    </g>,
    <g key="2">
      <path d="M6 20V9a6 6 0 0 1 12 0v11Z" />
      <path d="M9 9V6M15 9V6" />
    </g>,
    <g key="3">
      <path d="M5 17h14" />
      <path d="M6 17c0-4 2.7-7 6-7s6 3 6 7" />
      <path d="M12 7V4" />
    </g>,
  ];

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      {shapes[variant % shapes.length]}
    </svg>
  );
}

/** A four-pointed sparkle: "this was generated", on the AI photo button. */
export function SparkIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={1.8}>
      <path d="M12 3.5 13.6 9 19 10.5 13.6 12 12 17.5 10.4 12 5 10.5 10.4 9Z" />
      <path d="M18.5 16.5 19 18.5 21 19l-2 .5-.5 2-.5-2L16 19l2-.5Z" />
    </svg>
  );
}

export function PlusIcon({ className, size = 14 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={2.6}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon({ className, size = 14 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={2.6}>
      <path d="M5 12h14" />
    </svg>
  );
}

/** The basket. A bag rather than a trolley — this is a restaurant. */
export function BagIcon({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={1.8}>
      <path d="M5.5 8h13l-1 11.5a1.5 1.5 0 0 1-1.5 1.4H8a1.5 1.5 0 0 1-1.5-1.4Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}

export function TrashIcon({ className, size = 15 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={1.9}>
      <path d="M4 7h16M10 4h4M9.5 7l.6 12M14.5 7l-.6 12" />
      <path d="M6 7h12l-.9 13.1a1.5 1.5 0 0 1-1.5 1.4H8.4a1.5 1.5 0 0 1-1.5-1.4Z" />
    </svg>
  );
}

/** A receipt, for the "my orders" button. */
export function ReceiptIcon({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={1.8}>
      <path d="M6 3.5h12v17l-2.2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 20.5Z" />
      <path d="M9.5 8.5h5M9.5 12.5h5" />
    </svg>
  );
}

export function BellIcon({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={1.8}>
      <path d="M6.5 9a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 13 6.5 9Z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function BellOffIcon({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={1.8}>
      <path d="M6.5 9a5.5 5.5 0 0 1 8.2-4.8M17.5 11.5c.2 2.2 1.5 3 1.5 3H8" />
      <path d="M10 18a2 2 0 0 0 4 0M4 3l17 17" />
    </svg>
  );
}

export function ClockIcon({ className, size = 14 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={1.9}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

export function QrIcon({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={1.8}>
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
      <path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM14 20h1M20 14h-1" />
    </svg>
  );
}

export function DownloadIcon({ className, size = 15 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={1.9}>
      <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" />
    </svg>
  );
}
