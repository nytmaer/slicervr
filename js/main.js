/**
 * SlicerVR - Hybrid Desktop/VR Version
 * Works on desktop browsers AND Meta Quest!
 */

// Global state
let isDesktopMode = true;
let isVRMode = false;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 SlicerVR (Hybrid) initializing...');
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    const overlay = document.getElementById('overlay');
    const desktopButton = document.getElementById('desktop-mode');
    const enterVRButton = document.getElementById('enter-vr');
    const scene = document.getElementById('scene');
    
    // Desktop Mode Button
    desktopButton.addEventListener('click', () => {
        console.log('🖥️ Starting in Desktop mode');
        isDesktopMode = true;
        isVRMode = false;
        startDesktopMode();
    });
    
    // VR Mode Button
    enterVRButton.addEventListener('click', async () => {
        console.log('🥽 Starting in VR mode');
        
        // Check VR support
        if (!await checkVRSupport()) {
            showError('VR not supported. Try Desktop Mode instead!');
            return;
        }
        
        isDesktopMode = false;
        isVRMode = true;
        await startVRMode();
    });
    
    // Listen for VR session events
    scene.addEventListener('enter-vr', () => {
        console.log('🥽 VR session started');
        onVRSessionStart();
    });
    
    scene.addEventListener('exit-vr', () => {
        console.log('👋 VR session ended');
        onVRSessionEnd();
        overlay.classList.remove('hidden');
    });
    
    // Setup state listeners
    setupStateListeners();
    
    console.log('✅ App initialized - Ready for Desktop or VR!');
}

/**
 * Check if VR is supported
 */
async function checkVRSupport() {
    if (!navigator.xr) {
        console.warn('⚠️ WebXR not supported');
        return false;
    }
    
    try {
        const supported = await navigator.xr.isSessionSupported('immersive-vr');
        if (supported) {
            console.log('✅ VR supported');
            return true;
        } else {
            console.warn('⚠️ VR not available');
            return false;
        }
    } catch (error) {
        console.error('❌ VR check failed:', error);
        return false;
    }
}

/**
 * Start Desktop Mode
 */
function startDesktopMode() {
    const overlay = document.getElementById('overlay');
    const scene = document.getElementById('scene');
    
    // Hide overlay
    overlay.classList.add('hidden');
    
    // Show desktop instructions
    updateInstructions(true);
    
    // Enable desktop controls
    enableDesktopControls();
    
    // Show help panel
    showHelpPanel(true);
    
    showDebugNotification('Desktop Mode Active', 'Use WASD to move, mouse to look', 3000);
    
    console.log('✅ Desktop mode started');
}

/**
 * Start VR Mode
 */
async function startVRMode() {
    try {
        // Request file access first (VR mode)
        const hasAccess = await requestFileAccess();
        
        if (!hasAccess) {
            showError('File access required for VR mode');
            return;
        }
        
        // Hide overlay
        const overlay = document.getElementById('overlay');
        overlay.classList.add('hidden');
        
        // Show VR instructions
        updateInstructions(false);
        
        // Enable VR controls
        enableVRControls();
        
        // Enter VR
        const scene = document.getElementById('scene');
        await scene.enterVR();
        
        console.log('✅ VR mode started');
        
    } catch (error) {
        console.error('❌ VR mode failed:', error);
        showError('Failed to start VR: ' + error.message);
    }
}

/**
 * Enable desktop controls
 */
function enableDesktopControls() {
    const cursor = document.getElementById('desktop-cursor');
    const leftHand = document.getElementById('left-hand');
    const rightHand = document.getElementById('right-hand');
    
    // Enable desktop cursor
    if (cursor) {
        cursor.setAttribute('visible', 'true');
    }
    
    // Hide VR controllers
    if (leftHand) leftHand.setAttribute('visible', 'false');
    if (rightHand) rightHand.setAttribute('visible', 'false');
    
    // Setup desktop file picker
    setupDesktopFilePicker();
    
    console.log('✅ Desktop controls enabled');
}

/**
 * Enable VR controls
 */
function enableVRControls() {
    const cursor = document.getElementById('desktop-cursor');
    const leftHand = document.getElementById('left-hand');
    const rightHand = document.getElementById('right-hand');
    
    // Hide desktop cursor
    if (cursor) {
        cursor.setAttribute('visible', 'false');
    }
    
    // Show VR controllers
    if (leftHand) leftHand.setAttribute('visible', 'true');
    if (rightHand) rightHand.setAttribute('visible', 'true');
    
    console.log('✅ VR controls enabled');
}

/**
 * Update instructions based on mode
 */
function updateInstructions(desktopMode) {
    const desktopInstructions = document.getElementById('desktop-instructions');
    const vrInstructions = document.getElementById('vr-instructions');
    
    if (desktopInstructions && vrInstructions) {
        desktopInstructions.setAttribute('visible', desktopMode.toString());
        vrInstructions.setAttribute('visible', (!desktopMode).toString());
    }
}

/**
 * Setup desktop file picker
 */
function setupDesktopFilePicker() {
    const browseButton = document.getElementById('browse-button');
    const fileInput = document.getElementById('desktop-file-input');
    
    if (!browseButton || !fileInput) {
        console.error('❌ Browse button or file input not found');
        return;
    }
    
    // When browse button is clicked in desktop mode
    browseButton.addEventListener('click', (evt) => {
        if (isDesktopMode) {
            console.log('📁 Opening desktop file picker...');
            showDebugNotification('Select Folder', 'Choose folder with videos', 2000);
            fileInput.click();
        }
        // VR mode handled by existing code in vr-scene.js
    });
    
    // When files are selected
    fileInput.addEventListener('change', async (evt) => {
        const files = Array.from(evt.target.files);
        
        if (files.length === 0) {
            showDebugNotification('No Files Selected', 'Please select a folder', 3000);
            return;
        }
        
        console.log(`📁 Selected ${files.length} files`);
        showDebugNotification(`Processing...`, `Found ${files.length} files`, 2000);
        
        await processDesktopFiles(files);
    });
    
    console.log('✅ Desktop file picker ready');
}

/**
 * Process files from desktop file picker
 */
async function processDesktopFiles(files) {
    try {
        // Filter for video files
        const videoFiles = files.filter(file => 
            file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4')
        );
        
        if (videoFiles.length === 0) {
            showError('No video files found. Please select a folder with .mp4 files.');
            showDebugNotification('No Videos', 'Try a folder with .mp4 files', 5000);
            return;
        }
        
        console.log(`✅ Found ${videoFiles.length} video files`);
        showDebugNotification(`Found ${videoFiles.length} Videos!`, 'Creating thumbnails...', 2000);
        
        // Convert File objects to video objects with metadata
        const videos = await Promise.all(videoFiles.map(async (file) => {
            const url = URL.createObjectURL(file);
            const metadata = await extractVideoMetadata(file);
            const fileSize = file.size;
            const sizeTier = window.fileAccessManager.checkFileSizeTier(fileSize);
            
            return {
                name: file.name,
                size: fileSize,
                sizeFormatted: formatFileSize(fileSize),
                lastModified: file.lastModified,
                file: file,
                url: url,
                duration: metadata.duration,
                width: metadata.width,
                height: metadata.height,
                thumbnail: null, // Will be generated
                sizeTier: sizeTier.tier,
                tierColor: sizeTier.color,
                tierIcon: sizeTier.icon,
                canLoad: sizeTier.canLoad
            };
        }));
        
        console.log('🖼️ Generating thumbnails...');
        
        // Generate thumbnails
        const videosWithThumbnails = await window.thumbnailGenerator.generateThumbnailsForVideos(
            videos,
            (current, total) => {
                console.log(`📊 Thumbnail progress: ${current}/${total}`);
                showDebugNotification(
                    `Creating Thumbnails...`,
                    `${current} of ${total} complete`,
                    500
                );
            }
        );
        
        console.log('✅ Thumbnails generated');
        showDebugNotification('Ready!', `${videosWithThumbnails.length} videos loaded`, 3000);
        
        // Add to app state - this triggers video grid update
        window.appState.addVideosToLibrary(videosWithThumbnails);
        
        // Hide help panel after successful load
        setTimeout(() => showHelpPanel(false), 3000);
        
    } catch (error) {
        console.error('❌ Error processing files:', error);
        showError('Failed to process videos: ' + error.message);
        showDebugNotification('Error', error.message, 5000);
    }
}

/**
 * Request file access (VR mode)
 */
async function requestFileAccess() {
    try {
        if (!window.fileAccessManager.isSupported()) {
            console.warn('⚠️ File System Access API not supported - using desktop mode');
            return false;
        }
        
        console.log('📁 Requesting file access (VR mode)...');
        showDebugNotification('Requesting Access...', 'Select folder with videos', 2000);
        
        const directoryHandle = await window.fileAccessManager.requestDirectoryAccess();
        
        if (!directoryHandle) {
            showDebugNotification('Cancelled', 'File access cancelled', 3000);
            return false;
        }
        
        console.log('✅ File access granted:', directoryHandle.name);
        showDebugNotification(`Folder: ${directoryHandle.name}`, 'Scanning videos...', 2000);
        
        await scanForVideos(directoryHandle);
        
        return true;
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('ℹ️ User cancelled');
            showDebugNotification('Cancelled', 'File access cancelled', 3000);
            return false;
        }
        console.error('❌ File access error:', error);
        showError('File access failed: ' + error.message);
        showDebugNotification('Error', error.message, 5000);
        return false;
    }
}

/**
 * Scan directory for videos (VR mode)
 */
async function scanForVideos(directoryHandle) {
    try {
        console.log('🔍 Scanning for videos...');
        showDebugNotification('Scanning...', 'Looking for .mp4 files', 1000);
        
        const videos = await window.fileAccessManager.scanForVideos(directoryHandle);
        
        if (videos.length === 0) {
            console.log('ℹ️ No videos found');
            showError('No videos found. Try Oculus/VideoShots folder.');
            showDebugNotification('No Videos', 'Try Oculus/VideoShots', 5000);
            return [];
        }
        
        console.log(`✅ Found ${videos.length} videos`);
        showDebugNotification(`Found ${videos.length} Videos!`, 'Generating thumbnails...', 2000);
        
        const videosWithThumbnails = await window.thumbnailGenerator.generateThumbnailsForVideos(
            videos,
            (current, total) => {
                console.log(`📊 Progress: ${current}/${total}`);
                showDebugNotification(
                    `Thumbnails...`,
                    `${current} of ${total}`,
                    500
                );
            }
        );
        
        console.log('✅ Thumbnails ready');
        showDebugNotification('Ready!', `${videos.length} videos loaded`, 3000);
        
        window.appState.addVideosToLibrary(videosWithThumbnails);
        
        return videosWithThumbnails;
        
    } catch (error) {
        console.error('❌ Scan error:', error);
        showError('Scan failed: ' + error.message);
        showDebugNotification('Error', error.message, 5000);
        return [];
    }
}

/**
 * Extract video metadata
 */
async function extractVideoMetadata(file) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        video.onloadedmetadata = () => {
            resolve({
                duration: video.duration * 1000,
                width: video.videoWidth,
                height: video.videoHeight
            });
            URL.revokeObjectURL(video.src);
        };
        
        video.onerror = () => {
            resolve({ duration: 0, width: 0, height: 0 });
        };
        
        video.src = URL.createObjectURL(file);
    });
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Called when VR session starts
 */
function onVRSessionStart() {
    document.body.classList.add('vr-active');
    showDebugNotification('VR Active!', 'Use triggers to interact', 3000);
    showHelpPanel(true);
    setTimeout(() => showHelpPanel(false), 5000);
}

/**
 * Called when VR session ends
 */
function onVRSessionEnd() {
    document.body.classList.remove('vr-active');
    if (window.appState.playback.isPlaying) {
        window.appState.setPlaybackState(false);
    }
}

/**
 * Show/hide help panel
 */
function showHelpPanel(visible) {
    const helpPanel = document.getElementById('help-panel');
    if (helpPanel) {
        helpPanel.setAttribute('visible', visible.toString());
    }
}

/**
 * Setup state listeners
 */
function setupStateListeners() {
    window.appState.subscribe('currentVideo', (video) => {
        if (video) {
            console.log('📹 Video selected:', video.name);
            showDebugNotification('Video Loaded', video.name, 2000);
        }
    });
    
    window.appState.subscribe('exportProgress', (progress) => {
        if (progress.progress === 100) {
            console.log('✅ Export complete');
            showDebugNotification('Export Complete!', 'Video ready!', 5000);
        }
    });
}

/**
 * Show debug notification
 */
function showDebugNotification(title, subtitle = '', duration = 2000) {
    const notification = document.getElementById('debug-notification');
    const titleText = document.getElementById('debug-text');
    const subtitleText = document.getElementById('debug-subtext');
    
    if (!notification || !titleText || !subtitleText) return;
    
    titleText.setAttribute('value', title);
    subtitleText.setAttribute('value', subtitle);
    notification.setAttribute('visible', 'true');
    
    if (duration > 0) {
        setTimeout(() => {
            notification.setAttribute('visible', 'false');
        }, duration);
    }
}

/**
 * Show error
 */
function showError(message) {
    console.error('❌', message);
    showDebugNotification('ERROR', message, 5000);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message show';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #f44336; color: white; padding: 15px 30px; border-radius: 5px; z-index: 10000;';
    document.body.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

// Global error handlers
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showError('Error: ' + event.error.message);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
    showError('Error: ' + event.reason);
});

console.log('✅ Main.js (Hybrid) loaded');
