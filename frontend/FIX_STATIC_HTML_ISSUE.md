# Fix: Server returning HTML instead of main.*.js (Unexpected token '<')

## Problem
When the browser requests:
- `https://lukewestbrookmanhattan.com/static/js/main.ab8e4b75.js`

the server returns the **index.html** content instead of the real JavaScript file. So the browser tries to run HTML as JS and shows:
**Uncaught SyntaxError: Unexpected token '<'**

## Cause
The server is configured to return `index.html` for (almost) every request (SPA fallback). It is **not** serving the files inside the `static` folder first. So `/static/js/main.xxx.js` also gets `index.html`.

## Fix on the server (Nginx / Apache / Hostinger)

### Rule
1. **First:** Serve real files for `/static/*` (and other assets) from your **build** folder.
2. **Then:** For other paths (e.g. `/`, `/admin`, `/book-call`), return `index.html` (SPA fallback).

### Nginx example
Your site root should point to the folder that contains both `index.html` and the `static` folder (the React build output), e.g. `/var/www/lukewestbrookmanhattan.com` or similar.

```nginx
server {
    listen 80;
    server_name lukewestbrookmanhattan.com www.lukewestbrookmanhattan.com;
    root /var/www/lukewestbrookmanhattan.com;   # folder with index.html + static/

    # Serve static files (JS, CSS, etc.) - MUST come before the location /
    location /static/ {
        alias /var/www/lukewestbrookmanhattan.com/static/;
        try_files $uri =404;
    }

    # SPA fallback: all other routes get index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Important: The `location /static/` block must be **before** the `location /` block so that requests to `/static/js/main.xxx.js` get the real file, not `index.html`.

### Apache (.htaccess) example
If using Apache (e.g. on Hostinger), in the same folder as `index.html`:

```apache
# Serve existing files and directories, otherwise fallback to index.html
RewriteEngine On
RewriteBase /
RewriteRule ^static/ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Hostinger / cPanel
1. Upload the **entire** `frontend/build` folder contents (including `static` folder and `index.html`) to the public_html (or your domain’s root).
2. Ensure the hosting is set to serve **existing files** first; only requests that don’t match a file should be redirected to `index.html`. If there’s an “SPA” or “Single Page Application” option, use it only if it keeps `/static/*` as real files.

## Verify
After changing config:
1. Open: `https://lukewestbrookmanhattan.com/static/js/main.ab8e4b75.js`
2. You should see **JavaScript code** (minified), not HTML starting with `<!doctype html>`.

Once that URL returns JS, the app will load without the "Unexpected token '<'" error.
