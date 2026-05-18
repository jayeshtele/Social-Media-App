import {
  AlertCircle,
  Bookmark,
  Heart,
  Loader2,
  MessageCircle,
  Pause,
  Play,
  Radio,
  Volume2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import { useGetDiscoveryReelsQuery } from '../services/discoveryApi.js';
import { useGetReelsQuery, useToggleFollowMutation } from '../services/socialApi.js';
import { formatCount } from '../utils/format.js';

const REELS_PAGE_SIZE = 6;
const REEL_INTERACTIONS_KEY = 'pulse-reel-interactions-v1';

function mergeUniqueById(items) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function readReelInteractions() {
  if (typeof localStorage === 'undefined') return {};

  try {
    return JSON.parse(localStorage.getItem(REEL_INTERACTIONS_KEY)) || {};
  } catch {
    localStorage.removeItem(REEL_INTERACTIONS_KEY);
    return {};
  }
}

function getReelInteraction(interactions, reelId) {
  return interactions[reelId] || { liked: false, saved: false, comments: [] };
}

function ReelVideo({
  activeReelId,
  onVideoPause,
  onVideoPlay,
  playReel,
  reel,
  registerVideo,
}) {
  const videoRef = useRef(null);
  const isPlaying = activeReelId === reel.id;

  useEffect(() => {
    if (!videoRef.current) return undefined;
    return registerVideo(reel.id, videoRef.current);
  }, [reel.id, registerVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (activeReelId !== reel.id && video && !video.paused) {
      video.pause();
    }
  }, [activeReelId, reel.id]);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      await playReel(reel.id, video);
    } else {
      video.pause();
    }
  }

  return (
    <div className="relative aspect-[9/14] bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        poster={reel.poster}
        loop
        playsInline
        preload="metadata"
        onPlay={() => onVideoPlay(reel.id)}
        onPause={() => onVideoPause(reel.id)}
      >
        <source src={reel.videoUrl} type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
      <button
        type="button"
        title={isPlaying ? 'Pause' : 'Play'}
        onClick={togglePlayback}
        className="focus-ring absolute left-1/2 top-1/2 z-20 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-950 shadow-soft transition hover:bg-pulse-cyan"
      >
        {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
      </button>
    </div>
  );
}

export default function Reels() {
  const sentinelRef = useRef(null);
  const [page, setPage] = useState(0);
  const [remoteReels, setRemoteReels] = useState([]);
  const [interactions, setInteractions] = useState(readReelInteractions);
  const [activeCommentReelId, setActiveCommentReelId] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [activeReelId, setActiveReelId] = useState(null);
  const videoRefs = useRef(new Map());
  const { data: localReels = [], isLoading: isLocalLoading } = useGetReelsQuery();
  const {
    data: liveData,
    isError: isLiveError,
    isFetching: isLiveFetching,
    refetch,
  } = useGetDiscoveryReelsQuery({ page, limit: REELS_PAGE_SIZE });
  const [toggleFollow] = useToggleFollowMutation();
  const reels = mergeUniqueById([...remoteReels, ...localReels]);
  const isLoading = isLocalLoading && !reels.length;
  const hasMore = Boolean(liveData?.hasMore);

  const registerVideo = useCallback((reelId, video) => {
    videoRefs.current.set(reelId, video);
    return () => {
      video.pause();
      videoRefs.current.delete(reelId);
    };
  }, []);

  const pauseAllReels = useCallback((exceptReelId = null) => {
    videoRefs.current.forEach((video, reelId) => {
      if (reelId !== exceptReelId && !video.paused) {
        video.pause();
      }
    });

    if (!exceptReelId) {
      setActiveReelId(null);
    }
  }, []);

  const playReel = useCallback(
    async (reelId, video) => {
      try {
        await video.play();
        pauseAllReels(reelId);
        setActiveReelId(reelId);
      } catch {
        setActiveReelId((current) => (current === reelId ? null : current));
      }
    },
    [pauseAllReels],
  );

  const handleVideoPlay = useCallback(
    (reelId) => {
      pauseAllReels(reelId);
      setActiveReelId(reelId);
    },
    [pauseAllReels],
  );

  const handleVideoPause = useCallback((reelId) => {
    setActiveReelId((current) => (current === reelId ? null : current));
  }, []);

  useEffect(() => {
    if (!liveData?.reels) return;

    setRemoteReels((current) => {
      if (liveData.skip === 0) return liveData.reels;
      return mergeUniqueById([...current, ...liveData.reels]);
    });
  }, [liveData]);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(REEL_INTERACTIONS_KEY, JSON.stringify(interactions));
  }, [interactions]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLiveFetching) {
          setPage((current) => current + 1);
        }
      },
      { rootMargin: '520px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLiveFetching]);

  useEffect(() => {
    const pauseAllForExit = () => pauseAllReels();

    function handleVisibilityChange() {
      if (document.hidden) {
        pauseAllReels();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', pauseAllForExit);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', pauseAllForExit);
      pauseAllReels();
    };
  }, [pauseAllReels]);

  function updateInteraction(reelId, updater) {
    setInteractions((current) => {
      const existing = getReelInteraction(current, reelId);
      return {
        ...current,
        [reelId]: updater(existing),
      };
    });
  }

  function toggleLike(reelId) {
    updateInteraction(reelId, (existing) => ({
      ...existing,
      liked: !existing.liked,
    }));
  }

  function toggleSave(reelId) {
    updateInteraction(reelId, (existing) => ({
      ...existing,
      saved: !existing.saved,
    }));
  }

  function updateCommentDraft(reelId, value) {
    setCommentDrafts((current) => ({
      ...current,
      [reelId]: value,
    }));
  }

  function submitComment(event, reelId) {
    event.preventDefault();
    const text = commentDrafts[reelId]?.trim();
    if (!text) return;

    updateInteraction(reelId, (existing) => ({
      ...existing,
      comments: [
        ...existing.comments,
        {
          id: `reel-comment-${Date.now()}`,
          author: 'jayesh.dev',
          text,
        },
      ],
    }));
    updateCommentDraft(reelId, '');
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 lg:py-6">
      <div className="mb-5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-white">Reels</h1>
            <span className="inline-flex items-center gap-1 rounded-lg border border-pulse-rose/40 bg-pulse-rose/10 px-2 py-1 text-xs font-black text-pulse-rose">
            <Radio className="h-3.5 w-3.5" />
            Live API
          </span>
        </div>
        <p className="text-sm text-zinc-500">
          {remoteReels.length
            ? `${remoteReels.length} live reels loaded. Keep scrolling for more.`
            : 'Fresh clips from the Pulse community.'}
        </p>
      </div>

      {isLiveError ? (
        <section className="surface mb-5 flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-zinc-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-pulse-amber" />
            <span>Live reels could not load. Local reels are still available.</span>
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="aspect-[9/14] animate-pulse rounded-lg bg-white/10" />
            ))
          : reels.map((reel) => (
              <article key={reel.id} className="surface overflow-hidden rounded-lg">
                <div className="relative">
                  <ReelVideo
                    activeReelId={activeReelId}
                    onVideoPause={handleVideoPause}
                    onVideoPlay={handleVideoPlay}
                    playReel={playReel}
                    reel={reel}
                    registerVideo={registerVideo}
                  />
                  <div className="absolute bottom-10 left-0 right-0 z-10 p-2 sm:bottom-12 sm:p-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={
                          reel.isRemote
                            ? `/explore?q=${encodeURIComponent(reel.user.username)}`
                            : `/profile/${reel.user.username}`
                        }
                        className="focus-ring rounded-full"
                      >
                        <Avatar user={reel.user} size="sm" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={
                            reel.isRemote
                              ? `/explore?q=${encodeURIComponent(reel.user.username)}`
                              : `/profile/${reel.user.username}`
                          }
                          className="block truncate text-[11px] font-black text-white hover:underline sm:text-sm"
                        >
                          {reel.user.username}
                        </Link>
                        <p className="truncate text-[10px] text-zinc-300 sm:text-xs">
                          {formatCount(reel.views)} views
                        </p>
                      </div>
                      {!reel.isRemote && !reel.user.isFollowing && !reel.user.isSelf ? (
                        <button
                          type="button"
                          onClick={() => toggleFollow(reel.user.id)}
                          className="focus-ring rounded-lg bg-white px-2.5 py-1.5 text-xs font-black text-ink-950 transition hover:bg-pulse-cyan"
                        >
                          Follow
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-1 text-[11px] leading-4 text-white sm:mt-2 sm:line-clamp-2 sm:text-sm sm:leading-5">
                      {reel.caption}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-zinc-300 sm:mt-2 sm:gap-2 sm:text-xs">
                      <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="truncate">{reel.audio}</span>
                    </p>
                  </div>
                </div>

                {(() => {
                  const interaction = getReelInteraction(interactions, reel.id);
                  const commentCount = interaction.comments.length;
                  const isCommentsOpen = activeCommentReelId === reel.id;

                  return (
                    <>
                      <div className="grid grid-cols-3 border-t border-white/10 bg-ink-850 p-1 sm:p-1.5">
                        <button
                          type="button"
                          title={interaction.liked ? 'Unlike' : 'Like'}
                          onClick={() => toggleLike(reel.id)}
                          className={`focus-ring flex min-h-10 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-bold transition hover:bg-white/10 hover:text-white sm:min-h-12 sm:gap-1 sm:text-[11px] ${
                            interaction.liked ? 'text-pulse-rose' : 'text-zinc-300'
                          }`}
                        >
                          <Heart
                            className={
                              interaction.liked
                                ? 'h-3.5 w-3.5 fill-current sm:h-4 sm:w-4'
                                : 'h-3.5 w-3.5 sm:h-4 sm:w-4'
                            }
                          />
                          <span className="max-w-full truncate px-1">
                            {formatCount(reel.likes + (interaction.liked ? 1 : 0))}
                          </span>
                        </button>

                        <button
                          type="button"
                          title="Comment"
                          onClick={() =>
                            setActiveCommentReelId((current) => (current === reel.id ? null : reel.id))
                          }
                          className={`focus-ring flex min-h-10 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-bold transition hover:bg-white/10 hover:text-white sm:min-h-12 sm:gap-1 sm:text-[11px] ${
                            isCommentsOpen ? 'text-pulse-cyan' : 'text-zinc-300'
                          }`}
                        >
                          <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="max-w-full truncate px-1">
                            {commentCount ? formatCount(commentCount) : 'Comment'}
                          </span>
                        </button>

                        <button
                          type="button"
                          title={interaction.saved ? 'Unsave' : 'Save'}
                          onClick={() => toggleSave(reel.id)}
                          className={`focus-ring flex min-h-10 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-bold transition hover:bg-white/10 hover:text-white sm:min-h-12 sm:gap-1 sm:text-[11px] ${
                            interaction.saved ? 'text-pulse-amber' : 'text-zinc-300'
                          }`}
                        >
                          <Bookmark
                            className={
                              interaction.saved
                                ? 'h-3.5 w-3.5 fill-current sm:h-4 sm:w-4'
                                : 'h-3.5 w-3.5 sm:h-4 sm:w-4'
                            }
                          />
                          <span className="max-w-full truncate px-1">
                            {interaction.saved ? 'Saved' : 'Save'}
                          </span>
                        </button>
                      </div>

                      {isCommentsOpen ? (
                        <div className="border-t border-white/10 bg-ink-900 p-3">
                          <div className="max-h-28 space-y-2 overflow-y-auto pr-1">
                            {interaction.comments.length ? (
                              interaction.comments.map((comment) => (
                                <p key={comment.id} className="text-xs leading-5 text-zinc-300">
                                  <span className="font-black text-white">{comment.author}</span>{' '}
                                  {comment.text}
                                </p>
                              ))
                            ) : (
                              <p className="text-xs text-zinc-500">No comments yet.</p>
                            )}
                          </div>
                          <form onSubmit={(event) => submitComment(event, reel.id)} className="mt-3 flex gap-2">
                            <input
                              value={commentDrafts[reel.id] || ''}
                              onChange={(event) => updateCommentDraft(reel.id, event.target.value)}
                              placeholder="Add a comment"
                              className="focus-ring h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 outline-none"
                            />
                            <button
                              type="submit"
                              disabled={!commentDrafts[reel.id]?.trim()}
                              className="focus-ring h-10 rounded-lg bg-pulse-cyan px-3 text-xs font-black text-ink-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Post
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </>
                  );
                })()}
              </article>
            ))}

        <div ref={sentinelRef} className="col-span-full grid min-h-24 place-items-center pb-4">
          {isLiveFetching ? (
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-zinc-300">
              <Loader2 className="h-4 w-4 animate-spin text-pulse-cyan" />
              Loading more reels
            </div>
          ) : hasMore ? (
            <p className="text-sm text-zinc-500">Scroll for more reels</p>
          ) : reels.length ? (
            <p className="text-sm text-zinc-500">You are caught up.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
