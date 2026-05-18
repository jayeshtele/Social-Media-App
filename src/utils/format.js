const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatCount(value = 0) {
  return compactFormatter.format(value);
}

export function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  const units = [
    ['y', 31536000],
    ['mo', 2592000],
    ['w', 604800],
    ['d', 86400],
    ['h', 3600],
    ['m', 60],
  ];

  const match = units.find(([, secondsInUnit]) => seconds >= secondsInUnit);
  if (!match) return 'now';

  const [label, secondsInUnit] = match;
  return `${Math.floor(seconds / secondsInUnit)}${label}`;
}
