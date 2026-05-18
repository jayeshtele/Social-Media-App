import {
  Bookmark,
  Camera,
  Check,
  Edit3,
  Grid3X3,
  Link as LinkIcon,
  MapPin,
  MessageCircle,
  Settings,
  UserPlus,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import {
  useGetProfileQuery,
  useGetSessionQuery,
  useToggleFollowMutation,
  useUpdateProfileMutation,
} from '../services/socialApi.js';
import { formatCount } from '../utils/format.js';

function ProfileGrid({ posts }) {
  if (!posts.length) {
    return (
      <div className="surface grid min-h-52 place-items-center rounded-lg p-8 text-center text-zinc-500">
        <div>
          <Camera className="mx-auto h-10 w-10 text-zinc-600" />
          <p className="mt-3 text-sm font-semibold">No posts yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
      {posts.map((post) => (
        <Link
          key={post.id}
          to={`/profile/${post.user.username}`}
          className="group focus-ring relative aspect-square overflow-hidden rounded-lg bg-white/5"
        >
          <img src={post.image} alt={post.caption} className="h-full w-full object-cover" />
          <div className="absolute inset-0 hidden items-center justify-center gap-5 bg-black/55 text-sm font-black text-white group-hover:flex">
            <span className="flex items-center gap-2">{formatCount(post.likesCount)} likes</span>
            <span className="flex items-center gap-2">{formatCount(post.commentsCount)} comments</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function Profile() {
  const { username } = useParams();
  const { data: session } = useGetSessionQuery();
  const profileUsername = username || session?.currentUser?.username;
  const { data, isLoading } = useGetProfileQuery(profileUsername, {
    skip: !profileUsername,
  });
  const [toggleFollow] = useToggleFollowMutation();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', location: '', website: '' });

  useEffect(() => {
    if (!data?.user) return;
    setForm({
      name: data.user.name,
      bio: data.user.bio,
      location: data.user.location,
      website: data.user.website,
    });
    setActiveTab('posts');
    setIsEditing(false);
  }, [data?.user]);

  async function handleProfileSave(event) {
    event.preventDefault();
    await updateProfile(form).unwrap();
    setIsEditing(false);
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <div className="surface h-56 animate-pulse rounded-lg" />
      </div>
    );
  }

  const { user, posts, savedPosts } = data;
  const visiblePosts = activeTab === 'saved' ? savedPosts : posts;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 lg:py-6">
      <section className="mb-6 grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
        <div className="flex justify-center md:justify-start">
          <Avatar user={user} size="xl" className="mt-2" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-black text-white">{user.username}</h1>
              <p className="truncate text-sm text-zinc-500">{user.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.isSelf ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing((value) => !value)}
                    className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg bg-white px-3 text-sm font-black text-ink-950 transition hover:bg-pulse-cyan"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    title="Settings"
                    className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => toggleFollow(user.id)}
                    className={`focus-ring inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-black transition ${
                      user.isFollowing
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-pulse-cyan text-ink-950 hover:bg-white'
                    }`}
                  >
                    {user.isFollowing ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <Link
                    to="/messages"
                    className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-black text-white hover:bg-white/10"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
            {[
              ['Posts', user.postsCount],
              ['Followers', user.followersCount],
              ['Following', user.followingCount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg px-2 py-2 text-center">
                <p className="text-base font-black text-white">{formatCount(value)}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </div>
            ))}
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileSave} className="surface mt-5 grid gap-3 rounded-lg p-4">
              {[
                ['name', 'Name'],
                ['bio', 'Bio'],
                ['location', 'Location'],
                ['website', 'Website'],
              ].map(([field, label]) => (
                <label key={field} className="grid gap-1 text-xs font-bold text-zinc-500">
                  {label}
                  <input
                    value={form[field]}
                    onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                    className="focus-ring h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none"
                  />
                </label>
              ))}
              <button
                type="submit"
                disabled={isSaving}
                className="focus-ring h-10 rounded-lg bg-pulse-cyan text-sm font-black text-ink-950 transition hover:bg-white disabled:opacity-60"
              >
                Save profile
              </button>
            </form>
          ) : (
            <div className="mt-5 space-y-2 text-sm leading-6 text-zinc-300">
              <p>{user.bio}</p>
              <p className="flex flex-wrap items-center gap-2 text-zinc-500">
                <MapPin className="h-4 w-4 text-pulse-amber" />
                {user.location}
              </p>
              <a
                href={`https://${user.website}`}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex items-center gap-2 rounded text-pulse-cyan hover:underline"
              >
                <LinkIcon className="h-4 w-4" />
                {user.website}
              </a>
            </div>
          )}
        </div>
      </section>

      <div className="mb-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-black ${
            activeTab === 'posts' ? 'bg-white text-ink-950' : 'text-zinc-400 hover:bg-white/10'
          }`}
        >
          <Grid3X3 className="h-4 w-4" />
          Posts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-black ${
            activeTab === 'saved' ? 'bg-white text-ink-950' : 'text-zinc-400 hover:bg-white/10'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          Saved
        </button>
      </div>

      <ProfileGrid posts={visiblePosts} />
    </div>
  );
}
