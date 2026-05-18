import { skipToken } from '@reduxjs/toolkit/query';
import { Info, Phone, Search, Send, Video } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import {
  useGetConversationQuery,
  useGetConversationsQuery,
  useSendMessageMutation,
} from '../services/socialApi.js';
import { timeAgo } from '../utils/format.js';

export default function Messages() {
  const { conversationId } = useParams();
  const { data: conversations = [] } = useGetConversationsQuery();
  const selectedId = conversationId || conversations[0]?.id;
  const { data: conversation } = useGetConversationQuery(selectedId || skipToken);
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!message.trim() || !selectedId) return;
    await sendMessage({ conversationId: selectedId, text: message }).unwrap();
    setMessage('');
  }

  return (
    <div className="mx-auto grid h-[calc(100vh-73px)] w-full max-w-6xl grid-cols-1 px-4 py-4 sm:px-6 lg:h-screen lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-4 lg:py-6">
      <aside
        className={`surface min-h-0 overflow-hidden rounded-lg ${
          conversationId ? 'hidden lg:block' : 'block'
        }`}
      >
        <div className="border-b border-white/10 p-4">
          <h1 className="text-xl font-black text-white">Messages</h1>
          <label className="mt-4 flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              placeholder="Search chats"
              className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
            />
          </label>
        </div>
        <div className="scrollbar-soft h-[calc(100%-97px)] overflow-y-auto p-2">
          {conversations.map((item) => (
            <Link
              key={item.id}
              to={`/messages/${item.id}`}
              className={`focus-ring flex items-center gap-3 rounded-lg p-3 transition ${
                item.id === selectedId ? 'bg-white text-ink-950' : 'text-zinc-300 hover:bg-white/10'
              }`}
            >
              <Avatar user={item.peer} showStatus={item.id === 'dm1'} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-black">{item.peer?.name}</p>
                  <span className="shrink-0 text-[11px] opacity-70">{timeAgo(item.updatedAt)}</span>
                </div>
                <p className="truncate text-xs opacity-75">{item.lastMessage?.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </aside>

      <section
        className={`surface min-h-0 overflow-hidden rounded-lg ${
          conversationId ? 'grid' : 'hidden lg:grid'
        } grid-rows-[auto_minmax(0,1fr)_auto]`}
      >
        {conversation ? (
          <>
            <header className="flex items-center gap-3 border-b border-white/10 p-4">
              <Link to={`/profile/${conversation.peer.username}`} className="focus-ring rounded-full">
                <Avatar user={conversation.peer} showStatus />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/profile/${conversation.peer.username}`}
                  className="block truncate text-sm font-black text-white hover:underline"
                >
                  {conversation.peer.name}
                </Link>
                <p className="text-xs text-pulse-lime">Active now</p>
              </div>
              <div className="flex items-center gap-1">
                {[Phone, Video, Info].map((Icon, index) => (
                  <button
                    key={index}
                    type="button"
                    title={['Call', 'Video', 'Info'][index]}
                    className="focus-ring grid h-10 w-10 place-items-center rounded-lg text-zinc-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </header>

            <div className="scrollbar-soft space-y-3 overflow-y-auto p-4">
              {conversation.messages.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-end gap-2 ${item.isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!item.isMine ? <Avatar user={item.sender} size="sm" /> : null}
                  <div
                    className={`max-w-[78%] rounded-lg px-3 py-2 text-sm leading-6 ${
                      item.isMine
                        ? 'bg-pulse-cyan text-ink-950'
                        : 'bg-white/10 text-zinc-100'
                    }`}
                  >
                    <p>{item.text}</p>
                    <p className={`mt-1 text-[11px] ${item.isMine ? 'text-ink-700' : 'text-zinc-500'}`}>
                      {timeAgo(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={`Message ${conversation.peer.name}`}
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  title="Send"
                  className="focus-ring grid h-9 w-9 place-items-center rounded-lg bg-pulse-cyan text-ink-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="grid place-items-center p-8 text-center text-zinc-500">
            <p>Select a conversation</p>
          </div>
        )}
      </section>
    </div>
  );
}
