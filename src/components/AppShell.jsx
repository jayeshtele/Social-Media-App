import {
  Bell,
  Clapperboard,
  Compass,
  Home,
  MessageCircle,
  PlusSquare,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { openCreatePost } from '../features/ui/uiSlice.js';
import {
  useGetNotificationsQuery,
  useGetSessionQuery,
} from '../services/socialApi.js';
import Avatar from './Avatar.jsx';
import PulseLogo from './brand/PulseLogo.jsx';
import CreatePostModal from './CreatePostModal.jsx';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/reels', label: 'Reels', icon: Clapperboard },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
];

function Brand() {
  return (
    <Link to="/" className="focus-ring flex items-center gap-3 rounded-lg px-2 py-1">
      <PulseLogo />
    </Link>
  );
}

function NavItem({ item, compact = false }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      title={item.label}
      className={({ isActive }) =>
        [
          'focus-ring flex items-center rounded-lg px-3 py-3 text-sm font-semibold transition',
          compact ? 'justify-center' : 'gap-4',
          isActive
            ? 'bg-white text-ink-950'
            : 'text-zinc-300 hover:bg-white/10 hover:text-white',
        ].join(' ')
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!compact ? <span>{item.label}</span> : null}
    </NavLink>
  );
}

function TopSearch() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/explore?q=${encodeURIComponent(trimmed)}` : '/explore');
  }

  return (
    <form onSubmit={handleSubmit} className="relative hidden min-w-0 flex-1 sm:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search"
        className="focus-ring h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none"
      />
    </form>
  );
}

function MobileNav() {
  const dispatch = useDispatch();
  const mobileItems = navItems.filter((item) =>
    ['Home', 'Explore', 'Reels', 'Messages', 'Profile'].includes(item.label),
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-ink-900/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-6 items-center gap-1">
        {mobileItems.slice(0, 3).map((item) => (
          <NavItem key={item.to} item={item} compact />
        ))}
        <button
          type="button"
          title="Create"
          onClick={() => dispatch(openCreatePost())}
          className="focus-ring grid h-11 place-items-center rounded-lg bg-pulse-cyan text-ink-950 transition hover:bg-white"
        >
          <PlusSquare className="h-5 w-5" />
        </button>
        {mobileItems.slice(3).map((item) => (
          <NavItem key={item.to} item={item} compact />
        ))}
      </div>
    </nav>
  );
}

export default function AppShell() {
  const dispatch = useDispatch();
  const { data: session } = useGetSessionQuery();
  const { data: notifications = [] } = useGetNotificationsQuery();
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <div className="min-h-screen bg-ink-950 text-zinc-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-white/10 bg-ink-900/95 p-5 lg:flex">
        <Brand />
        <nav className="mt-10 flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
          <button
            type="button"
            onClick={() => dispatch(openCreatePost())}
            className="focus-ring mt-2 flex items-center gap-4 rounded-lg bg-pulse-cyan px-3 py-3 text-sm font-black text-ink-950 transition hover:bg-white"
          >
            <PlusSquare className="h-5 w-5" />
            <span>Create</span>
          </button>
        </nav>
        <div className="surface rounded-lg p-3">
          <div className="flex items-center gap-3">
            <Avatar user={session?.currentUser} showStatus />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {session?.currentUser?.name || 'Pulse User'}
              </p>
              <p className="truncate text-xs text-zinc-500">
                @{session?.currentUser?.username || 'user'}
              </p>
            </div>
            <Settings className="h-4 w-4 text-zinc-500" />
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-950/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <Brand />
          <TopSearch />
          <Link
            to="/notifications"
            title="Notifications"
            className="focus-ring relative ml-auto grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-zinc-200"
          >
            <Bell className="h-5 w-5" />
            {unreadCount ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-pulse-rose px-1 text-[10px] font-black text-white">
                {unreadCount}
              </span>
            ) : null}
          </Link>
        </div>
      </header>

      <main className="min-h-screen pb-24 lg:pl-72 lg:pb-0">
        <Outlet />
      </main>
      <MobileNav />
      <CreatePostModal />
    </div>
  );
}
