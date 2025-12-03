# BOP ClipCut WebXR - In-Headset Video Editor

## 🎯 Mission
Edit Quest/Horizon Worlds recordings directly in VR without removing your headset.

## 🏗️ Architecture

### Tech Stack
- **WebXR Device API** - VR headset integration
- **A-Frame** - VR scene framework (built on Three.js)
- **FFmpeg.wasm** - Browser-based video processing
- **File System Access API** - Access Quest recordings
- **HTML5 Video** - Video playback
- **Web Share API** - Social platform sharing

### Project Structure
```
clipcut-webxr/
├── index.html              # Entry point
├── manifest.json           # PWA manifest
├── styles/
│   ├── main.css           # 2D fallback styles
│   └── vr-ui.css          # VR-specific styling
├── js/
│   ├── main.js            # App initialization
│   ├── vr-scene.js        # A-Frame scene setup
│   ├── components/
│   │   ├── video-panel.js    # Video player component
│   │   ├── timeline.js       # Trim timeline component
│   │   ├── video-grid.js     # Video library grid
│   │   └── export-panel.js   # Export settings UI
│   ├── utils/
│   │   ├── file-access.js    # Quest file system access
│   │   ├── video-processor.js # FFmpeg.wasm wrapper
│   │   └── thumbnail.js      # Thumbnail generation
│   └── state/
│       └── app-state.js      # Global state management
├── lib/
│   ├── aframe.min.js
│   ├── ffmpeg.wasm
│   └── dependencies...
└── assets/
    ├── icons/
    ├── textures/
    └── sounds/
```

## 🎮 User Flow

1. **Enter VR**
   - User opens Quest Browser → navigates to clipcut.app
   - Clicks "Enter VR" button
   - VR scene loads with floating UI panels

2. **Browse Videos**
   - Floating grid of Quest recordings
   - Controller laser pointer to select
   - Thumbnails show video preview

3. **Edit Video**
   - Selected video plays on large screen
   - Floating timeline below with trim handles
   - Drag handles with controllers to set in/out points
   - Scrub with controller thumbstick

4. **Export**
   - Floating panel with compression options (Light/Medium/Strong)
   - Format selector (MP4/GIF)
   - Size estimate display
   - Export button → progress bar in VR

5. **Share**
   - Download to Quest storage
   - Or share directly (if browser supports)

## 📐 VR Scene Layout

```
         [Skybox Environment]
              
              [Video Player]
              Large screen
              (3m wide, 16:9)
                   ↓
              [Timeline]
           Trim controls below
                   ↓
              [Control Panel]
        Export settings, buttons
                   
    [Video Library]    User    [Help Panel]
    Grid on left       ←•→     Instructions
```

## 🎨 Design Philosophy

**VR-Native UI:**
- Large, readable text (readable from 2m away)
- High contrast colors
- Haptic feedback on controller interactions
- Audio cues for actions
- Minimal cognitive load

**Performance:**
- Maintain 72fps minimum (Quest 2) / 90fps (Quest Pro)
- Lazy-load videos
- Stream processing (don't load entire video in RAM)
- Web Workers for FFmpeg processing

## 🚀 Development Phases

### Phase 1: VR Scene (Week 1)
- Basic A-Frame scene with skybox
- Controller tracking and laser pointers
- Floating panel system
- Hand gesture recognition

### Phase 2: Video Library (Week 2)
- File System Access API integration
- Video thumbnail generation (Canvas API)
- Grid layout with pagination
- Video selection interaction

### Phase 3: Video Playback (Week 3)
- HTML5 video on 3D plane
- Play/pause with controller
- Seek controls
- Volume control

### Phase 4: Trim Editor (Week 4)
- Timeline component with scrubber
- Draggable trim handles
- Frame-accurate seeking
- Snap-to-frame markers

### Phase 5: Export System (Week 5)
- FFmpeg.wasm integration
- Compression presets
- Progress tracking
- File download

### Phase 6: Polish (Week 6)
- GIF export
- Social sharing
- Error handling
- Performance optimization

## 🔧 Technical Challenges

### Challenge 1: File Access
**Problem:** Quest browser sandboxing  
**Solution:** File System Access API + user permission prompt

### Challenge 2: Video Processing Performance
**Problem:** FFmpeg in browser is slow  
**Solution:** Web Workers + streaming processing + quality presets

### Challenge 3: Memory Constraints
**Problem:** Quest browser has limited RAM  
**Solution:** Stream processing, don't load full video

### Challenge 4: VR UI Interaction
**Problem:** Traditional UI doesn't work in VR  
**Solution:** Ray-casting with controllers + large touch targets

## 📱 Quest Browser Support

**Supported APIs:**
✅ WebXR Device API
✅ File System Access API (with user permission)
✅ Web Workers
✅ WebAssembly (FFmpeg.wasm)
✅ HTML5 Video
⚠️ Web Share API (limited support)

**Performance:**
- Quest 2: 72Hz, 4GB RAM
- Quest 3: 90Hz, 8GB RAM
- Quest Pro: 90Hz, 12GB RAM

## 🎯 Next Steps

1. Set up basic HTML + A-Frame scene
2. Test VR mode in Quest browser
3. Implement controller interactions
4. Build video panel component
5. Integrate File System Access API
6. Wire up FFmpeg.wasm
7. Deploy to web host for testing

## 📦 Dependencies

```json
{
  "aframe": "^1.5.0",
  "ffmpeg.wasm": "^0.12.0",
  "three": "^0.160.0"
}
```

## 🌐 Deployment

**Options:**
1. **GitHub Pages** - Free hosting
2. **Vercel** - Free with custom domain
3. **Netlify** - Free tier available
4. **Custom domain** - clipcut.app

**Requirements:**
- HTTPS required for WebXR
- CORS headers for file access
- Service Worker for PWA features
