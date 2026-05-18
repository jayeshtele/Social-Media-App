import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Smile,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useAddCommentMutation,
  useToggleLikeMutation,
  useToggleSaveMutation,
} from '../services/socialApi.js';
import { formatCount, timeAgo } from '../utils/format.js';
import Avatar from './Avatar.jsx';

export default function FeedPost({ post }) {
  const [comment, setComment] = useState('');
  const commentInputRef = useRef(null);
  const [toggleLike] = useToggleLikeMutation();
  const [toggleSave] = useToggleSaveMutation();
  const [addComment, { isLoading: isCommenting }] = useAddCommentMutation();

  async function submitComment(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    await addComment({ postId: post.id, text: comment }).unwrap();
    setComment('');
  }

  function focusCommentInput() {
    document.getElementById(`comments-${post.id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    window.requestAnimationFrame(() => {
      commentInputRef.current?.focus();
    });
  }

  return (
    <article className="surface overflow-hidden rounded-lg">
      <header className="flex items-center gap-3 px-4 py-3">
        <Link to={`/profile/${post.user.username}`} className="focus-ring rounded-full">
          <Avatar user={post.user} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              to={`/profile/${post.user.username}`}
              className="focus-ring truncate rounded text-sm font-bold text-white hover:underline"
            >
              {post.user.username}
            </Link>
            <span className="h-1 w-1 rounded-full bg-zinc-600" />
            <span className="text-xs text-zinc-500">{timeAgo(post.createdAt)}</span>
          </div>
          <p className="truncate text-xs text-zinc-500">{post.location}</p>
        </div>
        <button
          type="button"
          title="More"
          className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </header>

      <button
        type="button"
        onDoubleClick={() => !post.likedByViewer && toggleLike(post.id)}
        className="block w-full bg-black"
      >
        <img
          src={post.image}
          alt={post.caption}
          className="aspect-[4/5] w-full object-cover sm:aspect-square"
        />
      </button>

      <div className="px-4 pb-4 pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            title={post.likedByViewer ? 'Unlike' : 'Like'}
            onClick={() => toggleLike(post.id)}
            className={`focus-ring grid h-9 w-9 place-items-center rounded-lg transition hover:bg-white/10 ${
              post.likedByViewer ? 'text-pulse-rose' : 'text-zinc-200'
            }`}
          >
            <Heart className={post.likedByViewer ? 'h-5 w-5 fill-current' : 'h-5 w-5'} />
          </button>
          <button
            type="button"
            title="Comments"
            onClick={focusCommentInput}
            className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-zinc-200 transition hover:bg-white/10"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          <button
            type="button"
            title="Share"
            className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-zinc-200 transition hover:bg-white/10"
          >
            <Send className="h-5 w-5" />
          </button>
          <button
            type="button"
            title={post.savedByViewer ? 'Unsave' : 'Save'}
            onClick={() => toggleSave(post.id)}
            className={`focus-ring ml-auto grid h-9 w-9 place-items-center rounded-lg transition hover:bg-white/10 ${
              post.savedByViewer ? 'text-pulse-amber' : 'text-zinc-200'
            }`}
          >
            <Bookmark className={post.savedByViewer ? 'h-5 w-5 fill-current' : 'h-5 w-5'} />
          </button>
        </div>

        <p className="mt-2 text-sm font-bold text-white">{formatCount(post.likesCount)} likes</p>
        <p className="mt-2 text-sm leading-6 text-zinc-200">
          <Link to={`/profile/${post.user.username}`} className="font-bold text-white hover:underline">
            {post.user.username}
          </Link>{' '}
          {post.caption}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to={`/explore?q=${encodeURIComponent(tag)}`}
              className="focus-ring rounded-lg bg-white/5 px-2 py-1 text-xs font-semibold text-pulse-cyan hover:bg-white/10"
            >
              #{tag}
            </Link>
          ))}
        </div>

        <div id={`comments-${post.id}`} className="mt-3 space-y-2">
          {post.commentsCount ? (
            <p className="text-xs font-semibold uppercase tracking-normal text-zinc-500">
              {post.commentsCount > 2 ? `View all ${post.commentsCount} comments` : 'Comments'}
            </p>
          ) : null}
          {post.comments.slice(-2).map((item) => (
            <p key={item.id} className="text-sm leading-5 text-zinc-300">
              <Link
                to={`/profile/${item.user.username}`}
                className="font-bold text-white hover:underline"
              >
                {item.user.username}
              </Link>{' '}
              {item.text}
            </p>
          ))}
        </div>

        <form onSubmit={submitComment} className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
          <Smile className="h-5 w-5 text-zinc-500" />
          <input
            ref={commentInputRef}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Add a comment..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
          />
          <button
            type="submit"
            disabled={!comment.trim() || isCommenting}
            className="focus-ring rounded-lg px-3 py-1.5 text-sm font-black text-pulse-cyan transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-zinc-600"
          >
            Post
          </button>
        </form>
      </div>
    </article>
  );
}
