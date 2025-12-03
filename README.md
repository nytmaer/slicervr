# 🎬 SlicerVR - In-Headset Video Editor

**Edit your Quest recordings without taking off your headset!**

A revolutionary WebXR video editor that runs directly in Meta Quest Browser. No app installation, no file transfers, no headset removal required.

[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://nytmaer.github.io/slicervr/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/badge/GitHub-Nytmaer-blue)](https://github.com/Nytmaer)

---

## ✨ Features

- 🎥 **Browse Quest recordings** directly from VR
- ✂️ **Trim videos** with intuitive timeline controls  
- 🎨 **Dual themes**: Cyberpunk neon & Material Design 2025
- 📦 **Compression presets**: Light, Medium, Strong (CRF-based)
- 🎞️ **Export to MP4 or GIF**
- 🎮 **Full VR controller support** with laser pointers
- 📱 **Progressive Web App** - installable on Quest

---

## 🚀 Try It Now

### On Meta Quest:
1. Open **Quest Browser**
2. Go to: `https://nytmaer.github.io/slicervr/`
3. Click **"Enter VR Mode"**
4. Use controllers to interact!

### Desktop Preview (2D mode):
Open the same URL in Chrome/Firefox to preview the interface.

---

## 🎮 Controls

### VR Mode (Quest):
- **Point** laser beams at buttons
- **Trigger** to click
- **Grip** to drag timeline handles
- **Thumbstick** to scrub video
- **A button** to toggle help

### Desktop Mode (Testing):
- **Click + Drag** to look around
- **WASD** to move
- **Q/E** to move up/down
- **Mouse** to click buttons
- **Reset View** button to recenter

---

## 🎨 Themes

Switch themes using the button in top-right corner!

### 🌟 Cyberpunk (Default)
- Neon purple (#b026ff) + Cyan (#00ffff)
- Chrome metallic surfaces
- Glowing panel borders
- Dense grid floor
- 300 stars

### 📱 Material Design 2025
- Modern Android aesthetic
- Purple (#6200EE) + Teal (#03DAC6)
- Clean, minimal design
- Subtle shadows
- 200 stars

---

## 📋 Requirements

- **Meta Quest 2, 3, or Pro** (Quest 1 untested)
- **Quest Browser** with WebXR support (pre-installed)
- **HTTPS hosting** (required for WebXR)

---

## 🏗️ Project Status

| Feature | Status | Phase |
|---------|--------|-------|
| VR Scene | ✅ Complete | Base |
| Dual Themes | ✅ Complete | Base |
| Playback Controls | ✅ Complete | Base |
| Timeline UI | ✅ Complete | Base |
| File Browser | 🔄 In Progress | Phase 1 |
| FFmpeg Integration | 📅 Planned | Phase 4 |
| GIF Export | 📅 Planned | Phase 5 |

**Current Version:** v0.5 (Demo)  
**Target:** v1.0 by end of Q1 2025

---

## 🛠️ Tech Stack

- **A-Frame 1.5.0** - WebXR/VR framework
- **FFmpeg.wasm** - Browser video processing
- **File System Access API** - Quest file access
- **Web Share API** - Social sharing
- **PWA** - Installable web app

**No backend required!** Everything runs in the browser.

---

## 📖 Documentation

- [**Technical README**](README-TECHNICAL.md) - Architecture details
- [**Deployment Guide**](DEPLOY.md) - Full hosting instructions
- [**Implementation Guide**](IMPLEMENTATION_GUIDE.md) - Development phases
- [**Quick Deploy**](QUICKSTART-DEPLOY.md) - Cheat sheet

---

## 🎯 Roadmap

### Phase 1 - File Access (Week 1)
- [ ] File System Access API integration
- [ ] Scan Quest recordings folder
- [ ] Generate thumbnails
- [ ] Populate video grid

### Phase 2 - Video Playback (Week 2)
- [x] Play/pause controls
- [x] Rewind/forward buttons
- [ ] Volume control
- [ ] Timestamp display

### Phase 3 - Trim Timeline (Week 3)
- [ ] Draggable trim handles
- [ ] Visual feedback
- [ ] Frame-accurate scrubbing

### Phase 4 - FFmpeg Integration (Week 4)
- [ ] Load FFmpeg.wasm
- [ ] Trim implementation
- [ ] Compression presets
- [ ] Progress tracking

### Phase 5 - GIF Export (Week 5)
- [ ] Two-pass palette generation
- [ ] Speed control
- [ ] Loop toggle
- [ ] Size optimization

### Phase 6 - Polish (Week 6)
- [ ] Error handling
- [ ] Haptic feedback
- [ ] Sound effects
- [ ] Performance optimization

---

## 💜 Support This Project

**Love SlicerVR?** Buy me a coffee! ☕

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20Me-FF5E5B?logo=ko-fi&logoColor=white&style=for-the-badge)](https://ko-fi.com/nytmaer)

Your support helps me:
- 🚀 Build new features (file browser, FFmpeg integration)
- 🐛 Fix bugs and improve performance
- 📚 Create better documentation
- 🎨 Add more themes and customization
- 💜 Keep SlicerVR free and open source

**Every coffee helps!** Thank you for your support! 🙏

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Credits

**Created by:** Kenan / Nytmaer  
**Project:** BOP (Builders of Possibilities)  
**Music:** Dark Spiral series on Bandcamp

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/Nytmaer/slicervr/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Nytmaer/slicervr/discussions)
- **Twitter/X:** [@Nytmaer](https://twitter.com/Nytmaer) (if you have one)

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐!

[![Star History Chart](https://api.star-history.com/svg?repos=Nytmaer/slicervr&type=Date)](https://star-history.com/#Nytmaer/slicervr&Date)

---

**Made with 💜 for the VR creator community**
