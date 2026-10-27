export default function CattleLogoIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sừng và đầu bò màu vàng hổ phách phối đen sang trọng */}
      <path
        d="M6 10C5.5 6 8 4 11 4C13 4 14.5 5.5 16 7C17.5 5.5 19 4 21 4C24 4 26.5 6 26 10C25 14 22 17 21 23C20.5 26 18.5 28 16 28C13.5 28 11.5 26 11 23C10 17 7 14 6 10Z"
        fill="currentColor"
      />
      <circle cx="12" cy="14" r="1.5" fill="#ffffff" />
      <circle cx="20" cy="14" r="1.5" fill="#ffffff" />
      <path
        d="M13 21C14 22 18 22 19 21"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
