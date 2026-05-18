import { ImagePlus, Sparkles } from 'lucide-react';
import { useDispatch } from 'react-redux';
import Avatar from '../components/Avatar.jsx';
import FeedPost from '../components/FeedPost.jsx';
import RightRail from '../components/RightRail.jsx';
import StoriesRail from '../components/StoriesRail.jsx';
import { openCreatePost } from '../features/ui/uiSlice.js';
import { useGetFeedQuery } from '../services/socialApi.js';

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="surface overflow-hidden rounded-lg">
          <div className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
            <div className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
            </div>
          </div>
          <div className="aspect-square animate-pulse bg-white/10" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-36 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-full animate-pulse rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const { data, isLoading } = useGetFeedQuery();

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,640px)_320px] lg:py-6">
      <div className="min-w-0 space-y-4">
        <StoriesRail />

        <section className="surface rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Avatar user={data?.viewer} />
            <button
              type="button"
              onClick={() => dispatch(openCreatePost())}
              className="focus-ring min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-400 transition hover:border-pulse-cyan hover:text-white"
            >
              Share a photo, thought, or update
            </button>
            <button
              type="button"
              onClick={() => dispatch(openCreatePost())}
              className="focus-ring grid h-11 w-11 place-items-center rounded-lg bg-pulse-cyan text-ink-950 transition hover:bg-white"
              title="Add media"
            >
              <ImagePlus className="h-5 w-5" />
            </button>
          </div>
        </section>

        <div className="flex items-center justify-between px-1">
          <h1 className="text-lg font-black text-white">Feed</h1>
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
            <Sparkles className="h-4 w-4 text-pulse-amber" />
            Latest first
          </div>
        </div>

        {isLoading ? (
          <FeedSkeleton />
        ) : (
          <div className="space-y-4">
            {data?.posts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      <RightRail />
    </div>
  );
}
