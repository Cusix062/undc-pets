export default async (req) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('undc-community');

    const url = new URL(req.url);
    let path = url.pathname;
    path = path.replace(/\/\.netlify\/functions\/api/, '');
    path = path.replace(/^\/api/, '') || '/';

    // GET /posts — list all posts
    if (req.method === 'GET' && path === '/posts') {
      const raw = await store.get('posts', { type: 'json' });
      return new Response(JSON.stringify(raw || []), { headers });
    }

    // POST /posts — create a new post
    if (req.method === 'POST' && path === '/posts') {
      const body = await req.json();
      const raw = await store.get('posts', { type: 'json' });
      const posts = raw || [];
      posts.unshift({
        ...body,
        id: body.id || `post_${Date.now()}`,
        likes: body.likes || 0,
        commentsCount: body.commentsCount || 0,
        comments: body.comments || [],
        createdAt: new Date().toISOString(),
      });
      await store.setJSON('posts', posts);
      return new Response(JSON.stringify(posts), { headers });
    }

    // PUT /posts/:id — update a post (likes, comments)
    if (req.method === 'PUT' && path.startsWith('/posts/')) {
      const postId = path.replace('/posts/', '');
      const body = await req.json();
      const raw = await store.get('posts', { type: 'json' });
      const posts = raw || [];
      const idx = posts.findIndex((p) => p.id === postId);
      if (idx === -1) {
        return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404, headers });
      }
      posts[idx] = { ...posts[idx], ...body };
      await store.setJSON('posts', posts);
      return new Response(JSON.stringify(posts), { headers });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
  } catch (err) {
    console.error('API Error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
};
