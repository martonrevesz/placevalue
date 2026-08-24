export function CheckIcon({ size = 24, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <path
        d="M4 12.5 9.5 18 20 6.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CrossIcon({ size = 24, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role="presentation"
      aria-hidden="true"
    >
      <path
        d="M5 5l14 14M19 5 5 19"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
