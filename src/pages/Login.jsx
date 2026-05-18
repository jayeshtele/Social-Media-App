import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PulseLogo from '../components/brand/PulseLogo.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('jayesh@pulse.dev');
  const [password, setPassword] = useState('password');

  function handleSubmit(event) {
    event.preventDefault();
    navigate('/');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink-950 px-4 py-10 text-zinc-100">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-ink-900 shadow-soft md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[420px] bg-black">
          <img
            src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80"
            alt="Architectural social feed preview"
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <PulseLogo className="mt-1" />
            <h1 className="mt-5 text-4xl font-black text-white">Social in motion</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-zinc-300">
              A dark social experience with feed, stories, reels, messages, notifications, and profile flows.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <h2 className="text-2xl font-black text-white">Sign in</h2>
          <p className="mt-2 text-sm text-zinc-500">Welcome back to your circle.</p>

          <label className="mt-8 grid gap-2 text-sm font-bold text-zinc-300">
            Email
            <span className="flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
              <Mail className="h-4 w-4 text-zinc-500" />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="min-w-0 flex-1 bg-transparent text-white outline-none"
              />
            </span>
          </label>

          <label className="mt-4 grid gap-2 text-sm font-bold text-zinc-300">
            Password
            <span className="flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
              <Lock className="h-4 w-4 text-zinc-500" />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="min-w-0 flex-1 bg-transparent text-white outline-none"
              />
            </span>
          </label>

          <button
            type="submit"
            className="focus-ring mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-pulse-cyan text-sm font-black text-ink-950 transition hover:bg-white"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </section>
    </main>
  );
}
