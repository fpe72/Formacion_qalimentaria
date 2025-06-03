// backend/middleware/noCache.js
module.exports = function noCache(req, res, next) {
  // Este middleware solo se monta en /final-exam, así que siempre ponemos los headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};
