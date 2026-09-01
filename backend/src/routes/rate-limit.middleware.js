const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000;
const rateLimitMaxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
const requestEntriesByIp = new Map();

function createRateLimitErrorResponse() {
  return {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Muitas requisições. Tente novamente em instantes.'
    }
  };
}

function removeExpiredEntries(now) {
  for (const [ipAddress, entry] of requestEntriesByIp.entries()) {
    if (entry.expiresAt <= now) {
      requestEntriesByIp.delete(ipAddress);
    }
  }
}

function rateLimitMiddleware(req, res, next) {
  const now = Date.now();

  removeExpiredEntries(now);

  const ipAddress = req.ip || 'unknown';
  const entry = requestEntriesByIp.get(ipAddress);

  if (!entry || entry.expiresAt <= now) {
    requestEntriesByIp.set(ipAddress, {
      count: 1,
      expiresAt: now + rateLimitWindowMs
    });
    return next();
  }

  if (entry.count >= rateLimitMaxRequests) {
    return res.status(429).json(createRateLimitErrorResponse());
  }

  entry.count += 1;
  return next();
}

module.exports = rateLimitMiddleware;
