exports.handler = async () => ({
  statusCode: 404,
  body: JSON.stringify({ error: 'Use api.mjs instead' }),
});
