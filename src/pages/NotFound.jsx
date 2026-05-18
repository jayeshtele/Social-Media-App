import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-10 text-center">
      <div className="max-w-md">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-white/10 text-pulse-cyan">
          <Compass className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-3xl font-black text-white">Page not found</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Try the feed or explore something new.
        </p>
        <Link
          to="/"
          className="focus-ring mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-pulse-cyan px-4 text-sm font-black text-ink-950 transition hover:bg-white"
        >
          Back to feed
        </Link>
      </div>
    </div>
  );
}
