import { AtSign, Check, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import {
  useGetNotificationsQuery,
  useMarkNotificationsReadMutation,
} from '../services/socialApi.js';
import { timeAgo } from '../utils/format.js';

const typeIcons = {
  like: Heart,
  follow: UserPlus,
  comment: MessageCircle,
  mention: AtSign,
  activity: Check,
};

export default function Notifications() {
  const { data: notifications = [], isLoading } = useGetNotificationsQuery();
  const [markNotificationsRead] = useMarkNotificationsReadMutation();
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 lg:py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Notifications</h1>
          <p className="mt-1 text-sm text-zinc-500">{unreadCount} unread updates</p>
        </div>
        <button
          type="button"
          onClick={() => markNotificationsRead()}
          className="focus-ring rounded-lg bg-white px-3 py-2 text-sm font-black text-ink-950 transition hover:bg-pulse-cyan"
        >
          Mark read
        </button>
      </div>

      <section className="surface overflow-hidden rounded-lg">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 border-b border-white/10 p-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            ))
          : notifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Check;
              return (
                <div
                  key={notification.id}
                  className={`flex items-center gap-3 border-b border-white/10 p-4 last:border-b-0 ${
                    notification.isRead ? 'bg-transparent' : 'bg-pulse-cyan/10'
                  }`}
                >
                  <Link to={`/profile/${notification.actor.username}`} className="focus-ring rounded-full">
                    <Avatar user={notification.actor} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-6 text-zinc-300">
                      <Link
                        to={`/profile/${notification.actor.username}`}
                        className="font-black text-white hover:underline"
                      >
                        {notification.actor.username}
                      </Link>{' '}
                      {notification.message}
                    </p>
                    <p className="text-xs text-zinc-500">{timeAgo(notification.createdAt)} ago</p>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 text-pulse-cyan">
                    <Icon className="h-5 w-5" />
                  </span>
                  {notification.post ? (
                    <img
                      src={notification.post.image}
                      alt={notification.post.caption}
                      className="hidden h-12 w-12 rounded-lg object-cover sm:block"
                    />
                  ) : null}
                </div>
              );
            })}
      </section>
    </div>
  );
}
