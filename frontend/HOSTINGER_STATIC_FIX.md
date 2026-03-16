# Hostinger: Fix static files returning HTML (404 → index.html)

## Problem
- Opening `/static/js/main.xxx.js` or `manifest.json` shows HTML (or "Unexpected token '<'").
- This usually means: **404 Error Document** is set to **index.html**, so any "file not found" returns your SPA's index.html.

## Fix in Hostinger Panel

### Step 1: Error Pages / 404 Document
1. Log in to **Hostinger hPanel**.
2. Go to **Advanced** → **Error Pages** (or **Error Documents** / **Custom Error Pages**).
3. Find **404 Not Found**.
4. **Remove** or **clear** the custom 404 page if it points to **index.html** or **/index.html**.
5. Set it to **Default** (or leave blank) so 404s return a real 404, not index.html.
6. Save.

### Step 2: Keep .htaccess for SPA routes only
Your **public_html/.htaccess** should only rewrite **non-file** requests to index.html. Keep it as:

```apache
RewriteEngine On

# Do NOT rewrite /static/ - serve real files
RewriteCond %{REQUEST_URI} ^/static/
RewriteRule ^ - [L]

# Do NOT rewrite if file or directory exists
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# SPA: everything else -> index.html
RewriteRule ^ index.html [L]
```

### Step 3: Verify files exist
In **File Manager**:
- `public_html/static/js/main.ab8e4b75.js` → must exist
- `public_html/manifest.json` → must exist
- `public_html/index.html` → must exist

If any path is different (e.g. different case, or inside a subfolder), fix upload so paths match what the browser requests.

### Step 4: If still not working – contact Hostinger
Send something like:

"I have a Single Page Application (React) in public_html. Requests to real files like /static/js/main.ab8e4b75.js and /manifest.json are returning index.html instead of the actual files, causing 'Unexpected token <' errors. My .htaccess is in place to serve /static/ and existing files first, then index.html for other routes. Please check:
1. Is a custom 404 Error Document set to index.html? If yes, I need it removed or set to default so missing URLs return 404, not index.html.
2. Is .htaccess in public_html being applied? If not, please enable it or tell me how to get static files under /static/ served correctly."

## Quick test after fix
Open in browser:
- https://lukewestbrookmanhattan.com/static/js/main.ab8e4b75.js  
  → Should show **JavaScript code**, not HTML.
- https://lukewestbrookmanhattan.com/manifest.json  
  → Should show **JSON**, not HTML.
