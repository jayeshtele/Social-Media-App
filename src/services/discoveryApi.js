import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const DISCOVERY_LIMIT = 18;
const REEL_VIDEO_POOL = [
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
];

function stableCount(seed, base, spread) {
  return base + ((seed * 137) % spread);
}

function makeRemoteUser(user) {
  if (!user) {
    return {
      id: 'remote-u-unknown',
      username: 'pulse.creator',
      name: 'Pulse Creator',
      avatar: 'https://dummyjson.com/icon/pulse/128',
      bio: 'Creating and sharing from the live feed.',
      location: 'Worldwide',
      website: 'dummyjson.com',
      isVerified: false,
      isFollowing: false,
      isSelf: false,
      followersCount: 1200,
      followingCount: 180,
      postsCount: 24,
    };
  }

  const companyTitle = user.company?.title || 'Creator';
  const companyName = user.company?.name || 'Pulse';

  return {
    id: `remote-u-${user.id}`,
    remoteId: user.id,
    username: user.username,
    name: `${user.firstName} ${user.lastName}`,
    avatar: user.image,
    bio: `${companyTitle} at ${companyName}`,
    location: [user.address?.city, user.address?.state].filter(Boolean).join(', ') || 'Remote',
    website: `${user.username}.pulse.live`,
    isVerified: user.id % 5 === 0,
    isFollowing: false,
    isSelf: false,
    followersCount: stableCount(user.id, 1800, 98000),
    followingCount: stableCount(user.id, 90, 900),
    postsCount: stableCount(user.id, 12, 360),
  };
}

function makePostImage(post) {
  const tag = post.tags?.[0] || 'social';
  return `https://picsum.photos/seed/pulse-${tag}-${post.id}/1000/1000`;
}

function makeRemotePost(post, usersById) {
  const user = makeRemoteUser(usersById.get(post.userId));
  const createdAt = new Date(Date.now() - ((post.id % 72) + 1) * 60 * 60 * 1000).toISOString();

  return {
    id: `remote-p-${post.id}`,
    remoteId: post.id,
    isRemote: true,
    title: post.title,
    image: makePostImage(post),
    caption: post.body,
    location: user.location,
    tags: post.tags || [],
    createdAt,
    user,
    comments: [],
    commentsCount: Math.max(1, Math.round((post.reactions?.dislikes || 0) / 2)),
    likesCount: post.reactions?.likes || 0,
    views: post.views || 0,
    likedByViewer: false,
    savedByViewer: false,
    source: 'DummyJSON',
  };
}

function makeRemoteReel(post, usersById) {
  const user = makeRemoteUser(usersById.get(post.userId));
  const primaryTag = post.tags?.[0] || 'pulse';

  return {
    id: `remote-r-${post.id}`,
    remoteId: post.id,
    isRemote: true,
    user,
    poster: `https://picsum.photos/seed/pulse-reel-${primaryTag}-${post.id}/720/1120`,
    videoUrl: REEL_VIDEO_POOL[post.id % REEL_VIDEO_POOL.length],
    caption: post.title || post.body,
    audio: `${user.username} original audio`,
    views: post.views || stableCount(post.id, 12000, 460000),
    likes: post.reactions?.likes || stableCount(post.id, 700, 36000),
    tags: post.tags || [],
    source: 'DummyJSON',
  };
}

function collectTopics(posts) {
  const topicMap = new Map();

  posts.forEach((post) => {
    post.tags?.forEach((tag) => {
      topicMap.set(tag, (topicMap.get(tag) || 0) + 1);
    });
  });

  return [...topicMap.entries()]
    .map(([tag, postsCount]) => ({ tag, postsCount }))
    .sort((a, b) => b.postsCount - a.postsCount);
}

export const discoveryApi = createApi({
  reducerPath: 'discoveryApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://dummyjson.com' }),
  endpoints: (builder) => ({
    getDiscoveryFeed: builder.query({
      queryFn: async ({ query = '', page = 0, limit = DISCOVERY_LIMIT }, _api, _extra, fetchWithBQ) => {
        const search = query.trim();
        const skip = Math.max(0, page * limit);
        const encodedQuery = encodeURIComponent(search);
        const postsPath = search
          ? `/posts/search?q=${encodedQuery}&limit=${limit}&skip=${skip}`
          : `/posts?limit=${limit}&skip=${skip}`;
        const usersPath = '/users?limit=0&select=id,firstName,lastName,username,image,company,address';
        const searchUsersPath = search
          ? `/users/search?q=${encodedQuery}&limit=8&select=id,firstName,lastName,username,image,company,address`
          : `/users?limit=8&skip=${skip}&select=id,firstName,lastName,username,image,company,address`;

        const [postsResult, allUsersResult, searchedUsersResult] = await Promise.all([
          fetchWithBQ(postsPath),
          fetchWithBQ(usersPath),
          fetchWithBQ(searchUsersPath),
        ]);

        if (postsResult.error) return { error: postsResult.error };
        if (allUsersResult.error) return { error: allUsersResult.error };

        const allUsers = allUsersResult.data?.users || [];
        const searchedUsers = searchedUsersResult.data?.users || [];
        const usersById = new Map(allUsers.map((user) => [user.id, user]));
        const posts = (postsResult.data?.posts || []).map((post) => makeRemotePost(post, usersById));
        const suggestedUsers = searchedUsers.map(makeRemoteUser);
        const topics = collectTopics(posts.length ? posts : []);

        return {
          data: {
            posts,
            users: suggestedUsers,
            topics,
            total: postsResult.data?.total || posts.length,
            skip: postsResult.data?.skip || skip,
            limit: postsResult.data?.limit || limit,
            hasMore: skip + posts.length < (postsResult.data?.total || 0),
            query: search,
          },
        };
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}-${queryArgs.query || ''}-${queryArgs.page || 0}-${queryArgs.limit || DISCOVERY_LIMIT}`,
      keepUnusedDataFor: 120,
    }),
    getDiscoveryReels: builder.query({
      queryFn: async ({ page = 0, limit = 6 }, _api, _extra, fetchWithBQ) => {
        const skip = Math.max(0, page * limit);
        const postsPath = `/posts?limit=${limit}&skip=${skip}`;
        const usersPath = '/users?limit=0&select=id,firstName,lastName,username,image,company,address';

        const [postsResult, usersResult] = await Promise.all([
          fetchWithBQ(postsPath),
          fetchWithBQ(usersPath),
        ]);

        if (postsResult.error) return { error: postsResult.error };
        if (usersResult.error) return { error: usersResult.error };

        const usersById = new Map((usersResult.data?.users || []).map((user) => [user.id, user]));
        const reels = (postsResult.data?.posts || []).map((post) => makeRemoteReel(post, usersById));

        return {
          data: {
            reels,
            total: postsResult.data?.total || reels.length,
            skip: postsResult.data?.skip || skip,
            limit: postsResult.data?.limit || limit,
            hasMore: skip + reels.length < (postsResult.data?.total || 0),
          },
        };
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}-${queryArgs.page || 0}-${queryArgs.limit || 6}`,
      keepUnusedDataFor: 120,
    }),
  }),
});

export const { useGetDiscoveryFeedQuery, useGetDiscoveryReelsQuery } = discoveryApi;
