import {
  AlertCircle,
  Eye,
  Heart,
  Loader2,
  MessageCircle,
  Radio,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetDiscoveryFeedQuery } from '../services/discoveryApi.js';
import { useGetExploreQuery } from '../services/socialApi.js';
import { formatCount } from '../utils/format.js';

const PAGE_SIZE = 18;

function mergeUniqueById(items) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [draft, setDraft] = useState(query);
  const [page, setPage] = useState(0);
  const [remotePosts, setRemotePosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const { data: localData, isLoading: isLocalLoading } = useGetExploreQuery(query);
  const {
    data: liveData,
    isError: isLiveError,
    isFetching: isLiveFetching,
    refetch,
  } = useGetDiscoveryFeedQuery({ query, page, limit: PAGE_SIZE });

  useEffect(() => {
    setDraft(query);
    setPage(0);
    setRemotePosts([]);
  }, [query]);

  useEffect(() => {
    if (!liveData?.posts) return;

    setRemotePosts((current) => {
      if (liveData.skip === 0) return liveData.posts;
      return mergeUniqueById([...current, ...liveData.posts]);
    });
  }, [liveData]);

  useEffect(() => {
    if (!selectedPost) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setSelectedPost(null);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedPost]);

  function handleSubmit(event) {
    event.preventDefault();
    const nextQuery = draft.trim();
    setSearchParams(nextQuery ? { q: nextQuery } : {});
  }

  const posts = mergeUniqueById([...remotePosts, ...(localData?.posts || [])]);
  const isLoading = isLocalLoading && !posts.length;
  const liveCount = remotePosts.length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:py-6">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Explore</h1>
            <span className="inline-flex items-center gap-1 rounded-lg border border-pulse-rose/40 bg-pulse-rose/10 px-2 py-1 text-xs font-black text-pulse-rose">
              <Radio className="h-3.5 w-3.5" />
              Live API
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {liveCount ? `${liveCount} live posts loaded from the discovery API.` : 'Find what is moving right now.'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search Pulse"
            className="focus-ring h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none"
          />
        </form>
      </div>

      {isLiveError ? (
        <section className="surface mb-5 flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-zinc-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-pulse-amber" />
            <span>Live API content could not load. Local Pulse content is still available.</span>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-lg bg-white px-3 text-sm font-black text-ink-950 transition hover:bg-pulse-cyan"
          >
            Retry
          </button>
        </section>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-lg bg-white/10" />
          ))}
        </div>
      ) : (
        <section className="grid md:grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <button
              type="button"
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="group focus-ring relative aspect-square overflow-hidden rounded-lg bg-white/5 text-left"
            >
              <img src={post.image} alt={post.caption} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="truncate text-xs font-black text-white">{post.user.username}</p>
                {post.isRemote ? (
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-pulse-cyan">
                    <Eye className="h-3 w-3" />
                    {formatCount(post.views)} views
                  </p>
                ) : null}
              </div>
              <div className="absolute inset-0 hidden items-center justify-center gap-5 bg-black/55 text-sm font-black text-white group-hover:flex">
                <span className="flex items-center gap-2">
                  <Heart className="h-5 w-5 fill-current" />
                  {formatCount(post.likesCount)}
                </span>
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  {formatCount(post.commentsCount)}
                </span>
              </div>
            </button>
          ))}
        </section>
      )}

      <div className="mt-6 flex justify-center">
        {liveData?.hasMore ? (
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={isLiveFetching}
            className="focus-ring inline-flex h-11 min-w-44 items-center justify-center gap-2 rounded-lg bg-pulse-cyan px-4 text-sm font-black text-ink-950 transition hover:bg-white disabled:cursor-wait disabled:opacity-70"
          >
            {isLiveFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isLiveFetching ? 'Loading' : 'Load more'}
          </button>
        ) : posts.length ? (
          <p className="text-sm text-zinc-500">You are caught up.</p>
        ) : null}
      </div>

      {selectedPost ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-3 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Post image viewer"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPost(null);
            }
          }}
        >
          <div className="surface grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-lg shadow-soft md:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid min-h-0 place-items-center bg-black">
              <img
                src={selectedPost.image}
                alt={selectedPost.caption}
                className="max-h-[68vh] w-full object-contain md:max-h-[92vh]"
              />
            </div>
            <aside className="flex min-h-0 flex-col p-4">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">{selectedPost.user.username}</p>
                  <p className="truncate text-xs text-zinc-500">{selectedPost.location}</p>
                </div>
                <button
                  type="button"
                  title="Close"
                  onClick={() => setSelectedPost(null)}
                  className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto py-4">
                <p className="text-sm leading-6 text-zinc-200">{selectedPost.caption}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedPost.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-bold text-pulse-cyan"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
                <div className="rounded-lg bg-white/5 px-2 py-2">
                  <p className="text-sm font-black text-white">{formatCount(selectedPost.likesCount)}</p>
                  <p className="text-[11px] text-zinc-500">Likes</p>
                </div>
                <div className="rounded-lg bg-white/5 px-2 py-2">
                  <p className="text-sm font-black text-white">{formatCount(selectedPost.commentsCount)}</p>
                  <p className="text-[11px] text-zinc-500">Comments</p>
                </div>
                <div className="rounded-lg bg-white/5 px-2 py-2">
                  <p className="text-sm font-black text-white">{formatCount(selectedPost.views || 0)}</p>
                  <p className="text-[11px] text-zinc-500">Views</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      ) : null}
    </div>
  );
}
