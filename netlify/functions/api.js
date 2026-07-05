const fs = require('fs');
const DATA_FILE = '/tmp/posts.json';

function readPosts() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

function writePosts(posts) {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(posts)); } catch {}
}

exports.handler = async (event) => {
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
    let route = event.path
      .replace(/\/\.netlify\/functions\/api/, '')
      .replace(/^\/api/, '')
      .replace(/^\/+/, '');
    route = route || '/';

    console.log('API called:', { method: event.httpMethod, path: event.path, route });

    if (event.httpMethod === 'GET' && route === 'health') {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, path: event.path, route }) };
    }

    if (route === 'posts') {
      if (event.httpMethod === 'GET') {
        return { statusCode: 200, headers, body: JSON.stringify(readPosts()) };
      }
      if (event.httpMethod === 'POST') {
        const body = JSON.parse(event.body || '{}');
        const posts = readPosts();
        posts.unshift({
          ...body,
          id: body.id || `post_${Date.now()}`,
          likes: body.likes || 0,
          commentsCount: body.commentsCount || 0,
          comments: body.comments || [],
          createdAt: new Date().toISOString(),
        });
        writePosts(posts);
        return { statusCode: 200, headers, body: JSON.stringify(posts) };
      }
    }

    const postMatch = route.match(/^posts\/(.+)/);
    if (postMatch && event.httpMethod === 'PUT') {
      const postId = postMatch[1];
      const body = JSON.parse(event.body || '{}');
      const posts = readPosts();
      const idx = posts.findIndex((p) => p.id === postId);
      if (idx === -1) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Post not found' }) };
      }
      posts[idx] = { ...posts[idx], ...body };
      writePosts(posts);
      return { statusCode: 200, headers, body: JSON.stringify(posts) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found', path: event.path, route }) };
  } catch (err) {
    console.error('API Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
