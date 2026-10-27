export default function CattleLogoIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Sừng bò và đầu bò phong cách hiện đại */}
      <path d="M4 6c0-2 2-3 4-3 1.5 0 2.5 1 4 3 1.5-2 2.5-3 4-3 2 0 4 1 4 3 0 2-2 4-3 6l-1 5c-.3 1.5-1.5 2.5-3 2.5s-2.7-1-3-2.5l-1-5C7 10 4 8 4 6z" />
      <path d="M9 14h6" />
      <circle cx="9" cy="11" r="1" fill="currentColor" />
      <circle cx="15" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}
