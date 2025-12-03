# 🚀 GitHub Pages Deployment Guide

## Quick Deploy (5 Minutes)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name:** `clipcut-webxr` (or `bop-clipcut`)
3. **Visibility:** Public (required for free GitHub Pages)
4. **DO NOT** initialize with README
5. Click **Create repository**

---

### Step 2: Upload Your Project

Open terminal/command prompt in your `clipcut-webxr` folder:

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - BOP ClipCut VR v1"

# Add your GitHub repo as remote
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/clipcut-webxr.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Example if your username is "kenan":**
```bash
git remote add origin https://github.com/kenan/clipcut-webxr.git
```

---

### Step 3: Enable GitHub Pages

1. Go to your repo: `https://github.com/YOUR_USERNAME/clipcut-webxr`
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under "Source":
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **Save**
6. Wait 1-2 minutes

**Your site will be live at:**
```
https://YOUR_USERNAME.github.io/clipcut-webxr/
```

---

### Step 4: Test on Quest

1. Open **Quest Browser**
2. Navigate to: `https://YOUR_USERNAME.github.io/clipcut-webxr/`
3. Click **"Enter VR Mode"**
4. Use controllers to interact!

---

## 🎨 Add Icons & Sounds (Optional)

### Icons:
1. Create 192x192 and 512x512 PNG icons
2. Place in `assets/icons/`
3. Commit and push:
   ```bash
   git add assets/icons/
   git commit -m "Add app icons"
   git push
   ```

### Sounds:
1. Download click.mp3 and success.mp3 (see assets/sounds/README.md)
2. Place in `assets/sounds/`
3. Commit and push:
   ```bash
   git add assets/sounds/
   git commit -m "Add sound effects"
   git push
   ```

**OR skip sounds** by removing these lines from `index.html`:
```html
<audio id="click-sound" src="assets/sounds/click.mp3" preload="auto"></audio>
<audio id="success-sound" src="assets/sounds/success.mp3" preload="auto"></audio>
```

---

## 🌐 Custom Domain (Optional - $12/year)

### Buy Domain:
- **Namecheap**: clipcut.app (~$12/year)
- **Google Domains**: bopclipcut.com
- **Cloudflare**: clipcut.io

### Configure DNS:
1. Add CNAME record:
   ```
   Type: CNAME
   Name: www
   Value: YOUR_USERNAME.github.io
   ```

2. Add A records (for apex domain):
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153
   ```

3. In GitHub repo settings → Pages:
   - Enter your domain: `clipcut.app`
   - Check "Enforce HTTPS"

**Wait 24-48 hours for DNS propagation**

---

## 🔄 Update Your Site

Whenever you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

GitHub Pages auto-deploys in ~1 minute!

---

## 🐛 Troubleshooting

### "Page not found" error:
- Wait 2-3 minutes after enabling Pages
- Check Settings → Pages shows green checkmark
- Verify URL is correct

### WebXR not working:
- Must use HTTPS (GitHub Pages is HTTPS by default)
- Test in Quest Browser (not desktop Chrome)
- Enable WebXR in Quest Browser settings

### Icons not showing:
- Check file paths match manifest.json
- Icons must be PNG format
- Files must be in `assets/icons/` folder

### Sounds not working:
- Check browser console for errors (F12)
- Verify MP3 files exist
- Or remove audio tags if skipping sounds

---

## 📊 Analytics (Optional)

Add Google Analytics or Plausible to track usage:

```html
<!-- Add before </head> in index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
```

---

## 🚀 Alternative Deployment: Vercel

If you prefer Vercel:

```bash
npm i -g vercel
vercel login
vercel
```

Follow prompts. Done! Auto-generates URL.

---

## 📝 Repository URL Examples

Your repo will be at:
- `https://github.com/YOUR_USERNAME/clipcut-webxr`

Your site will be at:
- `https://YOUR_USERNAME.github.io/clipcut-webxr/`

With custom domain:
- `https://clipcut.app`

---

## ✅ Checklist

- [ ] Created GitHub repository
- [ ] Pushed code to GitHub
- [ ] Enabled GitHub Pages in settings
- [ ] Tested on Quest Browser
- [ ] (Optional) Added icons
- [ ] (Optional) Added sounds
- [ ] (Optional) Set up custom domain

---

## 🎯 Next Steps After Deploy

1. **Test thoroughly on Quest**
2. **Implement Phase 1**: File System Access API
3. **Add FFmpeg.wasm**: Video processing
4. **Beta test with friends**
5. **Launch!**

---

**Questions? Issues?**
- Check GitHub Pages status: Settings → Pages
- View build logs: Actions tab
- Test locally first: `python -m http.server 8000`
