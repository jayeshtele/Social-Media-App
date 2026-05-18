import { Hash, ImagePlus, MapPin, Send, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { closeCreatePost } from '../features/ui/uiSlice.js';
import {
  useCreatePostMutation,
  useGetSessionQuery,
} from '../services/socialApi.js';
import Avatar from './Avatar.jsx';

export default function CreatePostModal() {
  const fileInputId = useId();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector((state) => state.ui.isCreateOpen);
  const { data: session } = useGetSessionQuery();
  const [createPost, { isLoading }] = useCreatePostMutation();
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('buildinpublic, social');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') dispatch(closeCreatePost());
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, isOpen]);

  if (!isOpen) return null;

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!caption.trim()) return;

    await createPost({
      caption,
      image,
      location,
      tags: tags
        .split(',')
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter(Boolean),
    }).unwrap();

    setCaption('');
    setLocation('');
    setTags('buildinpublic, social');
    setImage('');
    dispatch(closeCreatePost());
    navigate('/');
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-post-title"
    >
      <form
        onSubmit={handleSubmit}
        className="surface max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-lg shadow-soft"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 id="create-post-title" className="text-base font-black text-white">
            Create post
          </h2>
          <button
            type="button"
            title="Close"
            onClick={() => dispatch(closeCreatePost())}
            className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid max-h-[calc(90vh-57px)] overflow-y-auto md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div className="border-b border-white/10 p-4 md:border-b-0 md:border-r">
            <label
              htmlFor={fileInputId}
              className="focus-ring group grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-white/10 bg-white/5 text-center"
              tabIndex={0}
            >
              {image ? (
                <img src={image} alt="Selected post preview" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-3 px-6 text-zinc-400">
                  <ImagePlus className="h-10 w-10 text-pulse-cyan" />
                  <span className="text-sm font-semibold text-zinc-200">
                    Upload an image or paste an image URL
                  </span>
                </span>
              )}
            </label>
            <input
              id={fileInputId}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
            <input
              value={image.startsWith('data:') ? '' : image}
              onChange={(event) => setImage(event.target.value)}
              placeholder="https://images..."
              className="focus-ring mt-3 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-500 outline-none"
            />
          </div>

          <div className="flex flex-col p-4">
            <div className="flex items-center gap-3">
              <Avatar user={session?.currentUser} />
              <div>
                <p className="text-sm font-bold text-white">
                  {session?.currentUser?.name || 'Pulse User'}
                </p>
                <p className="text-xs text-zinc-500">@{session?.currentUser?.username || 'user'}</p>
              </div>
            </div>

            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Write a caption..."
              rows={7}
              className="focus-ring mt-4 min-h-40 resize-none rounded-lg border border-white/10 bg-white/5 p-3 text-sm leading-6 text-white placeholder:text-zinc-500 outline-none"
            />

            <label className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
              <MapPin className="h-4 w-4 text-pulse-amber" />
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Location"
                className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              />
            </label>

            <label className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
              <Hash className="h-4 w-4 text-pulse-cyan" />
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="tags, separated, by comma"
                className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={!caption.trim() || isLoading}
              className="focus-ring mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-pulse-cyan px-4 text-sm font-black text-ink-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isLoading ? 'Posting' : 'Share'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
