# ⚡ Quick Deploy Cheat Sheet

## 1️⃣ Create Repo on GitHub
```
Go to: github.com/new
Name: clipcut-webxr
Visibility: Public
Click "Create repository"
```

## 2️⃣ Push Code (Run in project folder)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/clipcut-webxr.git
git branch -M main
git push -u origin main
```

## 3️⃣ Enable GitHub Pages
```
Repo → Settings → Pages
Source: main branch, / (root)
Save
```

## 4️⃣ Get Your URL
```
https://YOUR_USERNAME.github.io/clipcut-webxr/
```

## 5️⃣ Test on Quest
```
Open Quest Browser
Go to your URL
Click "Enter VR"
```

---

## 🔄 Update Site
```bash
git add .
git commit -m "Update message"
git push
```

---

## 🎨 Optional Assets

**Icons (can skip initially):**
- 192x192 PNG → `assets/icons/icon-192.png`
- 512x512 PNG → `assets/icons/icon-512.png`

**Sounds (can skip initially):**
- click.mp3 → `assets/sounds/click.mp3`
- success.mp3 → `assets/sounds/success.mp3`

**Or remove audio tags from index.html**

---

**Full guide:** See DEPLOY.md
