import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { seedDatabase } from '../data/seedData.js';

const STORAGE_KEY = 'pulse-social-db-v1';
const CURRENT_USER_ID = 'u1';
const DB_SCHEMA_VERSION = 2;
const DEFAULT_POST_IMAGE =
  'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80';

const clone = (value) => JSON.parse(JSON.stringify(value));

function createInitialDb() {
  return {
    schemaVersion: DB_SCHEMA_VERSION,
    ...clone(seedDatabase),
  };
}

function readDb() {
  if (typeof localStorage === 'undefined') return createInitialDb();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.schemaVersion === DB_SCHEMA_VERSION) return parsed;
      if (parsed.schemaVersion === 1) {
        const migrated = {
          ...parsed,
          schemaVersion: DB_SCHEMA_VERSION,
          reels: clone(seedDatabase.reels),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  const db = createInitialDb();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  return db;
}

function writeDb(db) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }
}

function delay(data, ms = 220) {
  return new Promise((resolve) => {
    globalThis.setTimeout(() => resolve({ data }), ms);
  });
}

function notFound(message) {
  return {
    error: {
      status: 404,
      data: { message },
    },
  };
}

function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getViewer(db) {
  return db.users.find((user) => user.id === CURRENT_USER_ID);
}

function decorateUser(user, db) {
  const viewer = getViewer(db);

  return {
    ...user,
    isSelf: user.id === CURRENT_USER_ID,
    isFollowing: viewer.followingIds.includes(user.id),
  };
}

function decorateComment(comment, db) {
  return {
    ...comment,
    user: decorateUser(db.users.find((user) => user.id === comment.userId), db),
  };
}

function decoratePost(post, db) {
  return {
    ...post,
    user: decorateUser(db.users.find((user) => user.id === post.userId), db),
    comments: post.comments.map((comment) => decorateComment(comment, db)),
    commentsCount: post.comments.length,
    likesCount: post.likedBy.length,
    likedByViewer: post.likedBy.includes(CURRENT_USER_ID),
    savedByViewer: post.savedBy.includes(CURRENT_USER_ID),
  };
}

function decorateConversation(conversation, db) {
  const participants = conversation.participantIds
    .map((id) => db.users.find((user) => user.id === id))
    .filter(Boolean)
    .map((user) => decorateUser(user, db));

  return {
    ...conversation,
    participants,
    peer: participants.find((user) => user.id !== CURRENT_USER_ID),
    messages: conversation.messages.map((message) => ({
      ...message,
      sender: decorateUser(db.users.find((user) => user.id === message.senderId), db),
      isMine: message.senderId === CURRENT_USER_ID,
    })),
    lastMessage: conversation.messages.at(-1),
  };
}

function normalizeSearch(value = '') {
  return value.trim().toLowerCase();
}

export const socialApi = createApi({
  reducerPath: 'socialApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Conversations', 'Feed', 'Notifications', 'Posts', 'Profile', 'Reels', 'Stories', 'Users'],
  endpoints: (builder) => ({
    getSession: builder.query({
      queryFn: async () => {
        const db = readDb();
        return delay({ currentUser: decorateUser(getViewer(db), db) });
      },
      providesTags: ['Users'],
    }),
    getStories: builder.query({
      queryFn: async () => {
        const db = readDb();
        const stories = db.stories.map((story) => ({
          ...story,
          user: decorateUser(db.users.find((user) => user.id === story.userId), db),
        }));
        return delay(stories);
      },
      providesTags: ['Stories'],
    }),
    getFeed: builder.query({
      queryFn: async () => {
        const db = readDb();
        const posts = [...db.posts]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((post) => decoratePost(post, db));
        return delay({ posts, viewer: decorateUser(getViewer(db), db) });
      },
      providesTags: (result) =>
        result
          ? [
              { type: 'Feed', id: 'LIST' },
              ...result.posts.map((post) => ({ type: 'Posts', id: post.id })),
            ]
          : [{ type: 'Feed', id: 'LIST' }],
    }),
    getPost: builder.query({
      queryFn: async (postId) => {
        const db = readDb();
        const post = db.posts.find((item) => item.id === postId);
        if (!post) return notFound('Post not found');
        return delay(decoratePost(post, db));
      },
      providesTags: (_result, _error, postId) => [{ type: 'Posts', id: postId }],
    }),
    getExplore: builder.query({
      queryFn: async (query = '') => {
        const db = readDb();
        const search = normalizeSearch(query);
        const decoratedPosts = db.posts.map((post) => decoratePost(post, db));
        const decoratedUsers = db.users.map((user) => decorateUser(user, db));
        const posts = search
          ? decoratedPosts.filter((post) =>
              [post.caption, post.location, post.user.username, post.user.name, ...post.tags]
                .join(' ')
                .toLowerCase()
                .includes(search),
            )
          : decoratedPosts;
        const users = search
          ? decoratedUsers.filter((user) =>
              [user.username, user.name, user.bio, user.location]
                .join(' ')
                .toLowerCase()
                .includes(search),
            )
          : decoratedUsers.filter((user) => user.id !== CURRENT_USER_ID).slice(0, 5);
        const topics = [...new Set(db.posts.flatMap((post) => post.tags))]
          .map((tag) => ({
            tag,
            postsCount: db.posts.filter((post) => post.tags.includes(tag)).length,
          }))
          .sort((a, b) => b.postsCount - a.postsCount);

        return delay({ posts, users, topics });
      },
      providesTags: ['Posts', 'Users'],
    }),
    getReels: builder.query({
      queryFn: async () => {
        const db = readDb();
        const reels = db.reels.map((reel) => ({
          ...reel,
          user: decorateUser(db.users.find((user) => user.id === reel.userId), db),
        }));
        return delay(reels);
      },
      providesTags: ['Reels'],
    }),
    getSuggestions: builder.query({
      queryFn: async () => {
        const db = readDb();
        const viewer = getViewer(db);
        const suggestions = db.users
          .filter((user) => user.id !== CURRENT_USER_ID && !viewer.followingIds.includes(user.id))
          .map((user) => decorateUser(user, db))
          .slice(0, 4);
        return delay(suggestions);
      },
      providesTags: ['Users'],
    }),
    getProfile: builder.query({
      queryFn: async (username) => {
        const db = readDb();
        const user = db.users.find((item) => item.username === username);
        if (!user) return notFound('Profile not found');

        const posts = db.posts
          .filter((post) => post.userId === user.id)
          .map((post) => decoratePost(post, db));
        const savedPosts = db.posts
          .filter((post) => post.savedBy.includes(CURRENT_USER_ID))
          .map((post) => decoratePost(post, db));

        return delay({
          user: decorateUser(user, db),
          posts,
          savedPosts,
        });
      },
      providesTags: (_result, _error, username) => [{ type: 'Profile', id: username }],
    }),
    getNotifications: builder.query({
      queryFn: async () => {
        const db = readDb();
        const notifications = db.notifications.map((notification) => ({
          ...notification,
          actor: decorateUser(db.users.find((user) => user.id === notification.actorId), db),
          post: notification.postId
            ? decoratePost(db.posts.find((post) => post.id === notification.postId), db)
            : null,
        }));
        return delay(notifications);
      },
      providesTags: ['Notifications'],
    }),
    getConversations: builder.query({
      queryFn: async () => {
        const db = readDb();
        const conversations = [...db.conversations]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .map((conversation) => decorateConversation(conversation, db));
        return delay(conversations);
      },
      providesTags: ['Conversations'],
    }),
    getConversation: builder.query({
      queryFn: async (conversationId) => {
        const db = readDb();
        const conversation = db.conversations.find((item) => item.id === conversationId);
        if (!conversation) return notFound('Conversation not found');
        return delay(decorateConversation(conversation, db));
      },
      providesTags: (_result, _error, conversationId) => [
        { type: 'Conversations', id: conversationId },
      ],
    }),
    toggleLike: builder.mutation({
      queryFn: async (postId) => {
        const db = readDb();
        const post = db.posts.find((item) => item.id === postId);
        if (!post) return notFound('Post not found');

        if (post.likedBy.includes(CURRENT_USER_ID)) {
          post.likedBy = post.likedBy.filter((id) => id !== CURRENT_USER_ID);
        } else {
          post.likedBy.push(CURRENT_USER_ID);
        }

        writeDb(db);
        return delay(decoratePost(post, db), 120);
      },
      invalidatesTags: (_result, _error, postId) => [
        { type: 'Posts', id: postId },
        { type: 'Feed', id: 'LIST' },
        'Notifications',
      ],
    }),
    toggleSave: builder.mutation({
      queryFn: async (postId) => {
        const db = readDb();
        const post = db.posts.find((item) => item.id === postId);
        if (!post) return notFound('Post not found');

        if (post.savedBy.includes(CURRENT_USER_ID)) {
          post.savedBy = post.savedBy.filter((id) => id !== CURRENT_USER_ID);
        } else {
          post.savedBy.push(CURRENT_USER_ID);
        }

        writeDb(db);
        return delay(decoratePost(post, db), 120);
      },
      invalidatesTags: (_result, _error, postId) => [
        { type: 'Posts', id: postId },
        { type: 'Feed', id: 'LIST' },
        'Profile',
      ],
    }),
    addComment: builder.mutation({
      queryFn: async ({ postId, text }) => {
        const db = readDb();
        const post = db.posts.find((item) => item.id === postId);
        if (!post) return notFound('Post not found');

        const comment = {
          id: makeId('c'),
          userId: CURRENT_USER_ID,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        };
        post.comments.push(comment);

        writeDb(db);
        return delay(decoratePost(post, db), 160);
      },
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Posts', id: postId },
        { type: 'Feed', id: 'LIST' },
        'Notifications',
      ],
    }),
    createPost: builder.mutation({
      queryFn: async ({ caption, image, location, tags = [] }) => {
        const db = readDb();
        const viewer = getViewer(db);
        const post = {
          id: makeId('p'),
          userId: CURRENT_USER_ID,
          image: image || DEFAULT_POST_IMAGE,
          caption: caption.trim(),
          location: location?.trim() || 'Pulse Studio',
          tags: tags.length ? tags : ['newpost'],
          createdAt: new Date().toISOString(),
          likedBy: [],
          savedBy: [],
          comments: [],
        };

        db.posts.unshift(post);
        viewer.postsCount += 1;
        writeDb(db);
        return delay(decoratePost(post, db), 220);
      },
      invalidatesTags: ['Posts', 'Feed', 'Profile'],
    }),
    toggleFollow: builder.mutation({
      queryFn: async (targetUserId) => {
        const db = readDb();
        const viewer = getViewer(db);
        const target = db.users.find((user) => user.id === targetUserId);
        if (!target) return notFound('User not found');

        const isFollowing = viewer.followingIds.includes(targetUserId);
        if (isFollowing) {
          viewer.followingIds = viewer.followingIds.filter((id) => id !== targetUserId);
          viewer.followingCount = Math.max(0, viewer.followingCount - 1);
          target.followersCount = Math.max(0, target.followersCount - 1);
        } else {
          viewer.followingIds.push(targetUserId);
          viewer.followingCount += 1;
          target.followersCount += 1;
        }

        writeDb(db);
        return delay(decorateUser(target, db), 140);
      },
      invalidatesTags: ['Users', 'Profile', 'Feed'],
    }),
    sendMessage: builder.mutation({
      queryFn: async ({ conversationId, text }) => {
        const db = readDb();
        const conversation = db.conversations.find((item) => item.id === conversationId);
        if (!conversation) return notFound('Conversation not found');

        conversation.messages.push({
          id: makeId('m'),
          senderId: CURRENT_USER_ID,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        });
        conversation.updatedAt = new Date().toISOString();
        writeDb(db);

        return delay(decorateConversation(conversation, db), 120);
      },
      invalidatesTags: (_result, _error, { conversationId }) => [
        'Conversations',
        { type: 'Conversations', id: conversationId },
      ],
    }),
    markNotificationsRead: builder.mutation({
      queryFn: async () => {
        const db = readDb();
        db.notifications = db.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }));
        writeDb(db);
        return delay(true, 100);
      },
      invalidatesTags: ['Notifications'],
    }),
    updateProfile: builder.mutation({
      queryFn: async (updates) => {
        const db = readDb();
        const viewer = getViewer(db);
        Object.assign(viewer, updates);
        writeDb(db);
        return delay(decorateUser(viewer, db), 160);
      },
      invalidatesTags: ['Users', 'Profile'],
    }),
  }),
});

export const {
  useAddCommentMutation,
  useCreatePostMutation,
  useGetConversationQuery,
  useGetConversationsQuery,
  useGetExploreQuery,
  useGetFeedQuery,
  useGetNotificationsQuery,
  useGetProfileQuery,
  useGetReelsQuery,
  useGetSessionQuery,
  useGetStoriesQuery,
  useGetSuggestionsQuery,
  useMarkNotificationsReadMutation,
  useSendMessageMutation,
  useToggleFollowMutation,
  useToggleLikeMutation,
  useToggleSaveMutation,
  useUpdateProfileMutation,
} = socialApi;
