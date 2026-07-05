import { getStore } from '@netlify/blobs';

async function getPosts() {
  try {
    const store = getStore('undc-community');
    const raw = await store.get('posts', { type: 'json' });
    return raw || [];
  } catch {
    return [];
  }
}

async function savePosts(posts) {
  const store = getStore('undc-community');
  await store.setJSON('posts', posts);
}

export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const path = event.path.replace(/\/\.netlify\/functions\/api/, '').replace(/^\/api/, '') || '/';

    if (event.httpMethod === 'GET' && path === '/posts') {
      const posts = await getPosts();
      return { statusCode: 200, headers, body: JSON.stringify(posts) };
    }

    if (event.httpMethod === 'POST' && path === '/posts') {
      const body = JSON.parse(event.body || '{}');
      const posts = await getPosts();
      posts.unshift({
        ...body,
        id: body.id || `post_${Date.now()}`,
        likes: body.likes || 0,
        commentsCount: body.commentsCount || 0,
        comments: body.comments || [],
        createdAt: new Date().toISOString(),
      });
      await savePosts(posts);
      return { statusCode: 200, headers, body: JSON.stringify(posts) };
    }

    if (event.httpMethod === 'PUT' && path.startsWith('/posts/')) {
      const postId = path.replace('/posts/', '');
      const body = JSON.parse(event.body || '{}');
      const posts = await getPosts();
      const idx = posts.findIndex((p) => p.id === postId);
      if (idx === -1) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Post not found' }) };
      }
      posts[idx] = { ...posts[idx], ...body };
      await savePosts(posts);
      return { statusCode: 200, headers, body: JSON.stringify(posts) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
  } catch (err) {
    console.error('API Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
