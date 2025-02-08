function saveOriginalUrl(req, res, next) {
   // Only save the URL if the request does NOT start with '/api/v1/auth'
  // (since all auth routes are mounted under '/api/v1/auth')
  if (req.method === 'GET' && !req.originalUrl.startsWith('/api/v1/auth')) {
    // Only set the originalUrl if it’s not already set
    if (!req.session.originalUrl) {
      req.session.originalUrl = req.originalUrl;
    }
  }
    next();
}

module.exports = saveOriginalUrl;