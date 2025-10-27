const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const port = process.env.PORT || 3000;
const baseDir = path.join(__dirname);

/**
 * Resolve the requested url to a safe absolute path under the base directory.
 * Returns the absolute path to the file that should be served.
 */
function resolvePath(requestUrl) {
  const { pathname } = new URL(requestUrl, `http://localhost:${port}`);
  const decodedPath = decodeURIComponent(pathname);
  const safePath = path.normalize(path.join(baseDir, decodedPath));

  if (!safePath.startsWith(baseDir)) {
    return null;
  }

  try {
    const stat = fs.statSync(safePath);
    if (stat.isDirectory()) {
      const indexFile = path.join(safePath, 'index.html');
      if (fs.existsSync(indexFile)) {
        return indexFile;
      }
    } else {
      return safePath;
    }
  } catch (err) {
    // File does not exist or is not accessible; handled by caller.
  }

  return null;
}

/**
 * Basic content type mapping for common static assets.
 */
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
      return 'application/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    case '.ico':
      return 'image/x-icon';
    case '.wav':
      return 'audio/wav';
    case '.mp3':
      return 'audio/mpeg';
    default:
      return 'application/octet-stream';
  }
}

const server = http.createServer((req, res) => {
  const filePath = resolvePath(req.url);

  if (!filePath) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('404 Not Found');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('500 Internal Server Error');
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', getContentType(filePath));
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
