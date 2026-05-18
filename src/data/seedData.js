export const seedDatabase = {
  users: [
    {
      id: 'u1',
      username: 'jayesh.dev',
      name: 'Jayesh Tele',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
      bio: 'Frontend engineer building polished products, shipping daily, and collecting city light.',
      location: 'Pune, India',
      website: 'jayesh.dev',
      isVerified: true,
      followersCount: 12840,
      followingCount: 482,
      postsCount: 42,
      followingIds: ['u2', 'u3', 'u5', 'u7'],
    },
    {
      id: 'u2',
      username: 'maya.lens',
      name: 'Maya Kapoor',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
      bio: 'Editorial photographer. Color, travel, portraits.',
      location: 'Mumbai, India',
      website: 'mayalens.studio',
      isVerified: true,
      followersCount: 96200,
      followingCount: 314,
      postsCount: 318,
      followingIds: ['u1', 'u3', 'u4'],
    },
    {
      id: 'u3',
      username: 'noah.codes',
      name: 'Noah Reed',
      avatar:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80',
      bio: 'Design systems, tiny tools, good coffee.',
      location: 'Bengaluru, India',
      website: 'noah.tools',
      isVerified: false,
      followersCount: 18300,
      followingCount: 221,
      postsCount: 116,
      followingIds: ['u1', 'u5'],
    },
    {
      id: 'u4',
      username: 'tara.moves',
      name: 'Tara Singh',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
      bio: 'Movement director. Reels, rhythm, stage notes.',
      location: 'Delhi, India',
      website: 'taramoves.co',
      isVerified: true,
      followersCount: 224000,
      followingCount: 681,
      postsCount: 502,
      followingIds: ['u2', 'u6', 'u8'],
    },
    {
      id: 'u5',
      username: 'arjun.eats',
      name: 'Arjun Mehta',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
      bio: 'Finding excellent food and better stories.',
      location: 'Ahmedabad, India',
      website: 'arjuneats.in',
      isVerified: false,
      followersCount: 44800,
      followingCount: 537,
      postsCount: 281,
      followingIds: ['u1', 'u2', 'u7'],
    },
    {
      id: 'u6',
      username: 'zara.fit',
      name: 'Zara Khan',
      avatar:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80',
      bio: 'Strength, mobility, recovery. Train with intent.',
      location: 'Hyderabad, India',
      website: 'zarakhan.fit',
      isVerified: true,
      followersCount: 310000,
      followingCount: 190,
      postsCount: 744,
      followingIds: ['u4', 'u8'],
    },
    {
      id: 'u7',
      username: 'ryan.trails',
      name: 'Ryan Dsouza',
      avatar:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80',
      bio: 'Weekend hikes, quiet routes, simple gear.',
      location: 'Goa, India',
      website: 'trailnotes.blog',
      isVerified: false,
      followersCount: 27400,
      followingCount: 403,
      postsCount: 139,
      followingIds: ['u1', 'u5'],
    },
    {
      id: 'u8',
      username: 'nina.design',
      name: 'Nina Rao',
      avatar:
        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&q=80',
      bio: 'Product designer. Interfaces for busy people.',
      location: 'Chennai, India',
      website: 'nina.design',
      isVerified: true,
      followersCount: 73100,
      followingCount: 288,
      postsCount: 207,
      followingIds: ['u1', 'u3'],
    },
  ],
  stories: [
    {
      id: 's1',
      userId: 'u2',
      preview:
        'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=360&q=80',
      seen: false,
    },
    {
      id: 's2',
      userId: 'u3',
      preview:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=360&q=80',
      seen: false,
    },
    {
      id: 's3',
      userId: 'u4',
      preview:
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=360&q=80',
      seen: true,
    },
    {
      id: 's4',
      userId: 'u5',
      preview:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=360&q=80',
      seen: false,
    },
    {
      id: 's5',
      userId: 'u6',
      preview:
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=360&q=80',
      seen: false,
    },
    {
      id: 's6',
      userId: 'u7',
      preview:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=360&q=80',
      seen: true,
    },
  ],
  posts: [
    {
      id: 'p1',
      userId: 'u2',
      image:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      caption:
        'Golden hour gave this hill station the exact cinematic glow I was chasing.',
      location: 'Mahabaleshwar',
      tags: ['travel', 'photography', 'goldenhour'],
      createdAt: '2026-05-18T06:55:00.000Z',
      likedBy: ['u1', 'u3', 'u4', 'u5', 'u8'],
      savedBy: ['u1', 'u8'],
      comments: [
        {
          id: 'c1',
          userId: 'u1',
          text: 'The warm highlights here are perfect.',
          createdAt: '2026-05-18T07:05:00.000Z',
        },
        {
          id: 'c2',
          userId: 'u8',
          text: 'That sky is doing serious work.',
          createdAt: '2026-05-18T07:18:00.000Z',
        },
      ],
    },
    {
      id: 'p2',
      userId: 'u3',
      image:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      caption:
        'Prototype sprint: notification grouping, keyboard states, and a calmer composer.',
      location: 'Bengaluru',
      tags: ['react', 'designsystems', 'buildinpublic'],
      createdAt: '2026-05-17T17:30:00.000Z',
      likedBy: ['u1', 'u2', 'u5', 'u8'],
      savedBy: ['u1', 'u3'],
      comments: [
        {
          id: 'c3',
          userId: 'u8',
          text: 'The composer idea needs to ship.',
          createdAt: '2026-05-17T17:48:00.000Z',
        },
      ],
    },
    {
      id: 'p3',
      userId: 'u5',
      image:
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=80',
      caption:
        'Tiny breakfast counter, huge flavor. The chili oil deserves its own fan club.',
      location: 'Old Ahmedabad',
      tags: ['food', 'streetfood', 'breakfast'],
      createdAt: '2026-05-17T04:10:00.000Z',
      likedBy: ['u1', 'u2', 'u6', 'u7'],
      savedBy: ['u2', 'u6'],
      comments: [
        {
          id: 'c4',
          userId: 'u7',
          text: 'Dropping this pin for my next trip.',
          createdAt: '2026-05-17T05:01:00.000Z',
        },
      ],
    },
    {
      id: 'p4',
      userId: 'u8',
      image:
        'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80',
      caption:
        'Dashboard layout study: less spectacle, more scannable decisions.',
      location: 'Chennai',
      tags: ['productdesign', 'ui', 'dashboard'],
      createdAt: '2026-05-16T15:25:00.000Z',
      likedBy: ['u1', 'u2', 'u3'],
      savedBy: ['u1', 'u3', 'u5'],
      comments: [
        {
          id: 'c5',
          userId: 'u3',
          text: 'This density feels very usable.',
          createdAt: '2026-05-16T16:20:00.000Z',
        },
      ],
    },
    {
      id: 'p5',
      userId: 'u7',
      image:
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
      caption:
        'A slow trail, cold air, and zero unread messages for three whole hours.',
      location: 'Western Ghats',
      tags: ['hiking', 'weekend', 'nature'],
      createdAt: '2026-05-15T10:44:00.000Z',
      likedBy: ['u1', 'u4', 'u5'],
      savedBy: ['u5'],
      comments: [],
    },
  ],
  reels: [
    {
      id: 'r1',
      userId: 'u4',
      poster:
        'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=720&q=80',
      videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
      caption: 'Footwork reset in 20 seconds.',
      audio: 'Original audio',
      views: 240000,
      likes: 18500,
    },
    {
      id: 'r2',
      userId: 'u6',
      poster:
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=720&q=80',
      videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      caption: 'Mobility flow for desk-heavy days.',
      audio: 'Zara Khan',
      views: 410000,
      likes: 36400,
    },
    {
      id: 'r3',
      userId: 'u2',
      poster:
        'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=720&q=80',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      caption: 'How I frame portraits in busy streets.',
      audio: 'Street ambience',
      views: 98000,
      likes: 9200,
    },
  ],
  notifications: [
    {
      id: 'n1',
      type: 'like',
      actorId: 'u2',
      postId: 'p2',
      message: 'liked your post.',
      createdAt: '2026-05-18T07:35:00.000Z',
      isRead: false,
    },
    {
      id: 'n2',
      type: 'follow',
      actorId: 'u6',
      message: 'started following you.',
      createdAt: '2026-05-18T06:20:00.000Z',
      isRead: false,
    },
    {
      id: 'n3',
      type: 'comment',
      actorId: 'u8',
      postId: 'p1',
      message: 'commented: That sky is doing serious work.',
      createdAt: '2026-05-17T18:20:00.000Z',
      isRead: true,
    },
    {
      id: 'n4',
      type: 'mention',
      actorId: 'u3',
      postId: 'p4',
      message: 'mentioned you in a dashboard thread.',
      createdAt: '2026-05-16T14:05:00.000Z',
      isRead: true,
    },
  ],
  conversations: [
    {
      id: 'dm1',
      participantIds: ['u1', 'u2'],
      updatedAt: '2026-05-18T07:38:00.000Z',
      messages: [
        {
          id: 'm1',
          senderId: 'u2',
          text: 'Sending the edits from the sunrise set tonight.',
          createdAt: '2026-05-18T06:50:00.000Z',
        },
        {
          id: 'm2',
          senderId: 'u1',
          text: 'Perfect. I will wire them into the launch grid.',
          createdAt: '2026-05-18T07:12:00.000Z',
        },
        {
          id: 'm3',
          senderId: 'u2',
          text: 'Also found a cleaner crop for the cover.',
          createdAt: '2026-05-18T07:38:00.000Z',
        },
      ],
    },
    {
      id: 'dm2',
      participantIds: ['u1', 'u8'],
      updatedAt: '2026-05-17T16:12:00.000Z',
      messages: [
        {
          id: 'm4',
          senderId: 'u8',
          text: 'The saved collection flow feels ready.',
          createdAt: '2026-05-17T15:52:00.000Z',
        },
        {
          id: 'm5',
          senderId: 'u1',
          text: 'Nice. I will test it on mobile widths next.',
          createdAt: '2026-05-17T16:12:00.000Z',
        },
      ],
    },
    {
      id: 'dm3',
      participantIds: ['u1', 'u5'],
      updatedAt: '2026-05-16T09:08:00.000Z',
      messages: [
        {
          id: 'm6',
          senderId: 'u5',
          text: 'Lunch shortlist is ready. Want spicy or safe?',
          createdAt: '2026-05-16T09:08:00.000Z',
        },
      ],
    },
  ],
};
