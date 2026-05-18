import { Plus } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { openCreatePost } from '../features/ui/uiSlice.js';
import { useGetSessionQuery, useGetStoriesQuery } from '../services/socialApi.js';
import Avatar from './Avatar.jsx';

export default function StoriesRail() {
  const dispatch = useDispatch();
  const { data: session } = useGetSessionQuery();
  const { data: stories = [], isLoading } = useGetStoriesQuery();

  return (
    <section className="surface rounded-lg p-3">
      <div className="scrollbar-soft flex gap-4 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => dispatch(openCreatePost())}
          className="focus-ring flex min-w-20 flex-col items-center gap-2 rounded-lg p-1 text-xs font-semibold text-zinc-300"
        >
          <span className="relative">
            <Avatar user={session?.currentUser} size="lg" />
            <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-ink-850 bg-pulse-cyan text-ink-950">
              <Plus className="h-3.5 w-3.5" />
            </span>
          </span>
          <span className="max-w-20 truncate">Your story</span>
        </button>

        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex min-w-20 flex-col items-center gap-2">
                <div className="h-14 w-14 animate-pulse rounded-full bg-white/10" />
                <div className="h-3 w-14 animate-pulse rounded bg-white/10" />
              </div>
            ))
          : stories.map((story) => (
              <Link
                key={story.id}
                to={`/profile/${story.user.username}`}
                className="focus-ring flex min-w-20 flex-col items-center gap-2 rounded-lg p-1 text-xs font-semibold text-zinc-300"
              >
                <span
                  className={`rounded-full p-0.5 ${
                    story.seen
                      ? 'bg-white/20'
                      : 'bg-[conic-gradient(#33e0d3,#ff4f86,#ffb84d,#33e0d3)]'
                  }`}
                >
                  <img
                    src={story.preview}
                    alt={`${story.user.name} story`}
                    className="h-14 w-14 rounded-full border-2 border-ink-850 object-cover"
                  />
                </span>
                <span className="max-w-20 truncate">{story.user.username}</span>
              </Link>
            ))}
      </div>
    </section>
  );
}
