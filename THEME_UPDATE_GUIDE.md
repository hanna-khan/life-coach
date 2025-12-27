# Theme System - Primary Color Updates

## ✅ Completed Updates

1. **CSS Utility Classes** (`index.css`)
   - `.bg-theme-accent`
   - `.text-theme-accent`
   - `.border-theme-accent`
   - `.ring-theme-accent`

2. **Components Updated:**
   - ✅ `Button.tsx` - All variants use theme colors
   - ✅ `Home.tsx` - All primary colors updated
   - ✅ `Footer.tsx` - Hover colors updated
   - ✅ `ProtectedRoute.tsx` - Loading spinner updated
   - ✅ `Navbar.tsx` - Links use theme colors

## 🔄 Pattern for Remaining Files

### Replace Tailwind Classes:

**Instead of:**
```tsx
className="bg-primary-600 text-primary-600 border-primary-600"
```

**Use:**
```tsx
className="bg-theme-accent text-theme-accent border-theme-accent"
```

**Or for inline styles:**
```tsx
style={{ backgroundColor: 'var(--theme-accent)', color: 'var(--theme-accent)' }}
```

### Common Replacements:

- `bg-primary-600` → `bg-theme-accent` or `style={{ backgroundColor: 'var(--theme-accent)' }}`
- `text-primary-600` → `text-theme-accent` or `style={{ color: 'var(--theme-accent)' }}`
- `border-primary-600` → `border-theme-accent` or `style={{ borderColor: 'var(--theme-accent)' }}`
- `hover:bg-primary-700` → `hover:bg-theme-accent-hover`
- `ring-primary-500` → `ring-theme-accent`
- `from-primary-600 to-primary-700` → `style={{ background: 'linear-gradient(to right, var(--theme-accent), var(--theme-accent-hover))' }}`

## 📋 Files Still Needing Updates

Remaining files with primary color usage:
- `pages/Contact.tsx`
- `pages/BookingSuccess.tsx`
- `pages/BookCall.tsx`
- `pages/BookingCancel.tsx`
- `pages/FAQ.tsx`
- `pages/About.tsx`
- `pages/AdminLogin.tsx`
- `pages/admin/Pricing.tsx`
- `pages/admin/Blogs.tsx`
- `pages/Blog.tsx`
- `pages/BlogPost.tsx`
- `pages/Resources.tsx`
- `pages/Login.tsx`
- `pages/Register.tsx`
- `components/Admin/Sidebar.tsx`
- `components/UI/LoadingOverlay.tsx`
- `components/UI/Input.tsx`

## 🎯 Quick Update Script Pattern

For each file, search and replace:
1. `primary-600` → theme-accent (where appropriate)
2. `primary-700` → theme-accent-hover
3. `primary-500` → theme-accent
4. `primary-100` → use CSS variable or light gray

## ✅ Theme System Status

- ✅ Theme Context created
- ✅ CSS Variables set up
- ✅ Utility classes added
- ✅ Most visible pages updated
- ⚠️  Remaining pages need gradual updates

