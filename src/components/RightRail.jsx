import { Sparkles, TrendingUp, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useGetExploreQuery,
  useGetSessionQuery,
  useGetSuggestionsQuery,
  useToggleFollowMutation,
} from '../services/socialApi.js';
import { formatCount } from '../utils/format.js';
import Avatar from './Avatar.jsx';

export default function RightRail() {
  const { data: session } = useGetSessionQuery();
  const { data: suggestions = [] } = useGetSuggestionsQuery();
  const { data: explore } = useGetExploreQuery('');
  const [toggleFollow] = useToggleFollowMutation();

  return (
    <aside className="hidden space-y-4 lg:block">
      <section className="surface rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Avatar user={session?.currentUser} size="lg" showStatus />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-white">{session?.currentUser?.name}</p>
            <p className="truncate text-xs text-zinc-500">@{session?.currentUser?.username}</p>
          </div>
          <Link
            to="/profile"
            className="focus-ring rounded-lg px-3 py-1.5 text-xs font-black text-pulse-cyan hover:bg-white/10"
          >
            View
          </Link>
        </div>
      </section>

      <section className="surface rounded-lg p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-black text-white">Suggested</h2>
          <Sparkles className="h-4 w-4 text-pulse-amber" />
        </div>
        <div className="space-y-4">
          {suggestions.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <Link to={`/profile/${user.username}`} className="focus-ring rounded-full">
                <Avatar user={user} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/profile/${user.username}`}
                  className="block truncate text-sm font-bold text-white hover:underline"
                >
                  {user.username}
                </Link>
                <p className="truncate text-xs text-zinc-500">
                  {formatCount(user.followersCount)} followers
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleFollow(user.id)}
                className="focus-ring grid h-9 w-9 place-items-center rounded-lg bg-white text-ink-950 transition hover:bg-pulse-cyan"
                title="Follow"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="surface rounded-lg p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-black text-white">Trending</h2>
          <TrendingUp className="h-4 w-4 text-pulse-cyan" />
        </div>
        <div className="flex flex-wrap gap-2">
          {explore?.topics.slice(0, 8).map((topic) => (
            <Link
              key={topic.tag}
              to={`/explore?q=${encodeURIComponent(topic.tag)}`}
              className="focus-ring rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-pulse-cyan hover:text-white"
            >
              #{topic.tag}
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
}
