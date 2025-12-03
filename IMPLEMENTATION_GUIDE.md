# BOP ClipCut WebXR - Implementation Guide

## 🎉 What We've Built

### ✅ Complete Project Scaffold (V2 - WebXR In-Headset Editor)

You now have a **fully structured WebXR video editing application** ready for implementation!

---

## 📦 Project Structure

```
clipcut-webxr/
├── index.html                    ✅ Complete VR scene with UI panels
├── manifest.json                 ✅ PWA configuration
├── README.md                     ✅ Project documentation
├── styles/
│   └── main.css                  ✅ 2D overlay + fallback styles
├── js/
│   ├── main.js                   ✅ App initialization & VR entry
│   ├── vr-scene.js               ✅ VR interactions & updates
│   ├── state/
│   │   └── app-state.js          ✅ Global state management
│   ├── components/
│   │   ├── video-panel.js        ✅ Video player (functional)
│   │   ├── timeline.js           🔨 Stub (needs implementation)
│   │   ├── video-grid.js         🔨 Stub (needs implementation)
│   │   └── export-panel.js       🔨 Stub (needs implementation)
│   └── utils/
│       ├── file-access.js        🔨 Stub (needs implementation)
│       ├── video-processor.js    🔨 Stub (needs implementation)
│       └── thumbnail.js          🔨 Stub (needs implementation)
└── assets/ (create these)
    ├── icons/
    ├── textures/
    └── sounds/
```

---

## 🎮 VR Scene Architecture

### Current Scene Layout:

```
                 [VR Space]
                      
        [Video Library]    [Video Player]    [Export Panel]
          (left side)      (center front)     (right side)
         Rotation: 30°         0°           Rotation: -30°
              
              [Timeline Controls]
             (below video player)
                Trim handles
                
         [Controllers with Laser Pointers]
              Left & Right Hand
```

### Interactive Elements:
- ✅ Video Player Screen (3m wide)
- ✅ Play/Pause Button
- ✅ Timeline with trim handles (draggable)
- ✅ Playhead indicator
- ✅ Video Library panel
- ✅ Browse Files button
- ✅ Export settings (Quality: Light/Medium/Strong)
- ✅ Format selector (MP4/GIF)
- ✅ Export button
- ✅ Help panel (toggle with A button)

---

## 🚀 Testing Instructions

### 1. **Local Development Setup**

```bash
# Option A: Simple HTTP Server (Python)
cd clipcut-webxr
python -m http.server 8000

# Option B: Node.js HTTP Server
npx http-server -p 8000

# Option C: VS Code Live Server
# Install "Live Server" extension, right-click index.html → Open with Live Server
```

### 2. **Test in Quest Browser**

**Method 1: Network Access (Same WiFi)**
1. Find your computer's IP address
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`
2. On Quest, open Browser
3. Navigate to: `http://YOUR_IP:8000`
4. Click "Enter VR Mode"

**Method 2: Deploy to Web**
```bash
# Deploy to GitHub Pages (free)
git init
git add .
git commit -m "Initial ClipCut WebXR"
git remote add origin https://github.com/YOUR_USERNAME/clipcut-webxr.git
git push -u origin main

# Enable GitHub Pages in repo settings
# Access at: https://YOUR_USERNAME.github.io/clipcut-webxr/
```

### 3. **Expected Behavior (Current)**

✅ **What Works:**
- Enter VR button
- VR scene loads with panels
- Controller laser pointers work
- Buttons are clickable
- State management updates
- Video panel component functional

⚠️ **What Needs Implementation:**
- File System Access API integration
- Video loading from Quest storage
- Timeline drag interactions
- Video trimming logic
- FFmpeg.wasm integration
- Actual video export

---

## 📋 Implementation Phases

### **Phase 1: File Access (Week 1)** - Priority: HIGH

**Goal:** Load Quest recordings into the app

**Tasks:**
1. Implement `file-access.js`:
   ```javascript
   // Request directory access
   const handle = await window.showDirectoryPicker();
   
   // Scan for video files
   for await (const entry of handle.values()) {
       if (entry.name.endsWith('.mp4')) {
           // Add to library
       }
   }
   ```

2. Populate video grid in `video-grid.js`:
   - Create thumbnail for each video
   - Display in 3D grid layout
   - Handle selection

3. Test:
   - Quest browser file picker works
   - Videos appear in library
   - Clicking video loads it

**Files to modify:**
- `js/utils/file-access.js`
- `js/components/video-grid.js`
- `js/utils/thumbnail.js`

---

### **Phase 2: Video Playback (Week 2)** - Priority: HIGH

**Goal:** Full video playback control

**Tasks:**
1. Wire up play/pause (mostly done in `video-panel.js`)
2. Implement scrubbing with thumbstick
3. Add volume controls
4. Display current time

**Test:**
- Video plays on floating screen
- Controllers can pause/play
- Thumbstick scrubs video
- Timestamp updates

**Files to modify:**
- `js/components/video-panel.js` (enhance)
- `js/vr-scene.js` (controller events)

---

### **Phase 3: Trim Timeline (Week 3)** - Priority: MEDIUM

**Goal:** Drag-to-trim functionality

**Tasks:**
1. Implement `timeline.js`:
   - Make handles draggable with grip button
   - Update trim range in state
   - Constrain handles to timeline bounds
   - Snap to frames (optional)

2. Visual feedback:
   - Highlight trim region
   - Show trim duration
   - Preview trim on playback

**Test:**
- Grab handles with controllers
- Drag to set trim points
- Video plays only trimmed section
- Trim duration displays

**Files to modify:**
- `js/components/timeline.js`
- `js/vr-scene.js` (drag logic)

---

### **Phase 4: FFmpeg Integration (Week 4)** - Priority: MEDIUM

**Goal:** Actual video processing

**Tasks:**
1. Add FFmpeg.wasm to project:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.0/dist/umd/ffmpeg.js"></script>
   ```

2. Implement `video-processor.js`:
   - Load FFmpeg
   - Trim video using FFmpeg commands
   - Compress video (CRF-based)
   - Show progress

3. Commands:
   ```javascript
   // Trim
   ffmpeg.exec(['-i', 'input.mp4', '-ss', '10', '-to', '30', '-c', 'copy', 'output.mp4']);
   
   // Compress
   ffmpeg.exec(['-i', 'input.mp4', '-c:v', 'libx264', '-crf', '28', 'output.mp4']);
   ```

**Test:**
- Export creates actual file
- Progress bar updates
- File downloads to Quest
- Size estimate accurate

**Files to modify:**
- `js/utils/video-processor.js`
- Add FFmpeg.wasm library

---

### **Phase 5: GIF Export (Week 5)** - Priority: LOW

**Goal:** GIF creation for social sharing

**Tasks:**
1. Validate GIF duration (2-10 seconds)
2. Implement two-pass GIF creation:
   ```javascript
   // Generate palette
   ffmpeg.exec(['-i', 'input.mp4', '-vf', 'palettegen', 'palette.png']);
   
   // Create GIF
   ffmpeg.exec(['-i', 'input.mp4', '-i', 'palette.png', 
                '-filter_complex', 'paletteuse', 'output.gif']);
   ```

3. Add speed control UI
4. Add loop toggle

**Test:**
- GIF export works
- File size reasonable
- Quality acceptable
- Speed multiplier works

**Files to modify:**
- `js/utils/video-processor.js`
- `js/components/export-panel.js`

---

### **Phase 6: Polish (Week 6)** - Priority: LOW

**Goal:** Production-ready experience

**Tasks:**
1. Error handling:
   - Graceful failures
   - User-friendly messages
   - Retry mechanisms

2. Performance optimization:
   - Lazy load videos
   - Stream processing
   - Memory management

3. UX improvements:
   - Haptic feedback
   - Sound effects
   - Loading indicators
   - Keyboard shortcuts

4. Social sharing:
   - Download to Quest storage
   - Web Share API (if supported)
   - Direct upload (future)

---

## 🔧 Technical Details

### State Management

All app state is centralized in `app-state.js`:

```javascript
// Access state
window.appState.currentVideo
window.appState.trimRange
window.appState.playback
window.appState.exportSettings

// Update state
window.appState.setCurrentVideo(video)
window.appState.setTrimRange(start, end)
window.appState.setPlaybackState(isPlaying)

// Listen to changes
window.appState.subscribe('currentVideo', (video) => {
    // React to video change
});
```

### VR Interactions

Controller events handled in `vr-scene.js`:

```javascript
// Click events
element.addEventListener('click', () => {});

// Grip (drag) events
element.addEventListener('gripdown', () => {});
element.addEventListener('gripup', () => {});

// Thumbstick
controller.addEventListener('thumbstickmoved', (evt) => {
    const x = evt.detail.x;  // -1 to 1
    const y = evt.detail.y;  // -1 to 1
});

// Buttons
controller.addEventListener('abuttondown', () => {});
controller.addEventListener('bbuttondown', () => {});
```

### Video Processing

FFmpeg.wasm commands:

```javascript
// Trim only (fast, no re-encoding)
await ffmpeg.exec([
    '-i', 'input.mp4',
    '-ss', '10',        // Start at 10s
    '-to', '30',        // End at 30s
    '-c', 'copy',       // Copy streams (fast)
    'output.mp4'
]);

// Trim + Compress
await ffmpeg.exec([
    '-i', 'input.mp4',
    '-ss', '10',
    '-to', '30',
    '-c:v', 'libx264',  // H.264 codec
    '-crf', '28',       // Quality (23=high, 28=medium, 33=low)
    '-preset', 'fast',
    '-c:a', 'aac',
    '-b:a', '128k',
    'output.mp4'
]);
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "WebXR not supported"
**Solution:** Only works in Quest Browser. Desktop browsers need WebXR polyfill.

### Issue 2: File System Access blocked
**Solution:** Requires HTTPS or localhost. Use `http-server` or deploy to web.

### Issue 3: Video won't load
**Solution:** Check CORS headers. Videos must be served from same origin or have CORS enabled.

### Issue 4: FFmpeg.wasm slow
**Solution:** 
- Use Web Workers
- Show progress indicator
- Use `-preset fast` flag
- Consider server-side processing for long videos

### Issue 5: Quest browser crashes
**Solution:**
- Process shorter videos first
- Stream processing instead of loading full video
- Monitor memory usage
- Use lower quality presets

---

## 📱 Quest Browser Limitations

**Memory:** ~2-4GB available  
**Processing:** Limited compared to desktop  
**File Access:** Requires user permission each session  
**Web Share:** Limited support  
**WebAssembly:** Supported but slower than native

**Recommendations:**
- Keep video segments under 2 minutes
- Default to "Strong" compression
- Show warnings for large files
- Implement streaming where possible

---

## 🌐 Deployment Options

### GitHub Pages (Free)
```bash
git push origin main
# Enable Pages in repo settings
```
Access: `https://username.github.io/clipcut-webxr`

### Vercel (Free)
```bash
npm i -g vercel
vercel
```
Get custom domain + auto HTTPS

### Netlify (Free)
```bash
npm i -g netlify-cli
netlify deploy
```
Drag & drop folder or CLI deploy

### Requirements:
- ✅ HTTPS (required for WebXR)
- ✅ CORS configured
- ✅ Service Worker (for PWA)

---

## 📚 Resources

**A-Frame Documentation:**  
https://aframe.io/docs/

**WebXR Device API:**  
https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API

**FFmpeg.wasm:**  
https://ffmpegwasm.netlify.app/

**File System Access API:**  
https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API

**Meta Quest Browser:**  
https://developer.oculus.com/documentation/web/browser-intro/

---

## 🎯 Next Immediate Steps

1. **Test the scaffold:**
   - Run local server
   - Open in Quest browser
   - Verify VR scene loads
   - Test controller interactions

2. **Implement Phase 1:**
   - File System Access API
   - Video scanning
   - Thumbnail generation
   - Grid display

3. **Get one video working end-to-end:**
   - Load video
   - Play/pause
   - Simple trim
   - Download result

4. **Then expand features incrementally**

---

## 💡 Tips

- Start simple: Get ONE video working before building the library
- Test often in actual Quest browser (behavior differs from desktop)
- Use `console.log()` liberally - check browser console
- Keep video lengths short during development (~30 seconds)
- Consider a "demo mode" with pre-loaded sample video

---

## 🚀 Success Criteria

**MVP (Minimum Viable Product):**
- ✅ Load video from Quest storage
- ✅ Play/pause in VR
- ✅ Trim video
- ✅ Export trimmed video
- ✅ Download to Quest

**V1.0 Complete:**
- ✅ Full video library
- ✅ Compression presets
- ✅ GIF export
- ✅ Progress indicators
- ✅ Error handling

**Future (V1.1+):**
- 🔮 Direct social media upload
- 🔮 Filters/effects
- 🔮 Text overlay
- 🔮 Audio mixing
- 🔮 Multi-clip editing

---

You now have everything you need to build an **in-headset video editor for Quest!** 🎉

The foundation is solid - now it's time to implement the features phase by phase. Start with Phase 1 (file access) and you'll have a working prototype within a week!
