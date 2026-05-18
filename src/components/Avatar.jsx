import { ShieldCheck } from 'lucide-react';

export default function Avatar({ user, size = 'md', showStatus = false, className = '' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-24 w-24',
  };

  if (!user) return null;

  return (
    <span className={`relative inline-flex shrink-0 ${className}`}>
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizes[size]} rounded-full border border-white/10 object-cover`}
      />
      {user.isVerified ? (
        <ShieldCheck
          aria-label="Verified"
          className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-ink-900 text-pulse-cyan"
        />
      ) : null}
      {showStatus ? (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-ink-900 bg-pulse-lime" />
      ) : null}
    </span>
  );
}
