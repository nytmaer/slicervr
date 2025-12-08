/**
 * BOP ClipCut - Main Application Entry
 * Initializes VR scene and handles app lifecycle
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 BOP ClipCut VR initializing...');
    
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    const overlay = document.getElementById('overlay');
    const enterVRButton = document.getElementById('enter-vr');
    const scene = document.getElementById('scene');
    
    // Check WebXR support
    checkWebXRSupport();
    
    // Enter VR button handler
    enterVRButton.addEventListener('click', async () => {
        try {
            // Request file system access for Quest recordings
            const hasAccess = await requestFileAccess();
            
            if (!hasAccess) {
                showError('File access required to browse Quest recordings');
                return;
            }
            
            // Hide overlay and enter VR
            overlay.classList.add('hidden');
            
            // Trigger A-Frame VR mode
            scene.enterVR();
            
            console.log('✅ Entered VR mode');
            
        } catch (error) {
            console.error('Error entering VR:', error);
            showError('Failed to enter VR mode: ' + error.message);
        }
    });
    
    // Handle VR session events
    scene.addEventListener('enter-vr', () => {
        console.log('🥽 VR session started');
        onVRSessionStart();
    });
    
    scene.addEventListener('exit-vr', () => {
        console.log('👋 VR session ended');
        onVRSessionEnd();
        overlay.classList.remove('hidden');
    });
    
    // Listen for state changes
    setupStateListeners();
    
    console.log('✅ App initialized');
}

/**
 * Check if WebXR is supported
 */
function checkWebXRSupport() {
    if (!navigator.xr) {
        console.warn('⚠️ WebXR not supported');
        showError('WebXR not supported. Please use Meta Quest Browser.');
        return false;
    }
    
    // Check for immersive-vr support
    navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        if (supported) {
            console.log('✅ WebXR VR supported');
        } else {
            console.warn('⚠️ VR mode not supported');
            showError('VR mode not available on this device');
        }
    });
    
    return true;
}

/**
 * Request file system access
 */
async function requestFileAccess() {
    try {
        // Check if File System Access API is available
        if (!window.fileAccessManager.isSupported()) {
            console.warn('⚠️ File System Access API not supported');
            showError('Your browser doesn\'t support file access. Please use Quest Browser v28 or later.');
            return false;
        }
        
        console.log('📁 Requesting file access...');
        
        // Request directory access
        const directoryHandle = await window.fileAccessManager.requestDirectoryAccess();
        
        if (!directoryHandle) {
            return false;
        }
        
        console.log('✅ File access granted:', directoryHandle.name);
        
        // Scan for videos
        await scanForVideos(directoryHandle);
        
        return true;
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('ℹ️ User cancelled file access');
            return false;
        }
        console.error('❌ File access error:', error);
        showError('Failed to access files: ' + error.message);
        return false;
    }
}

/**
 * Scan directory for video files
 */
async function scanForVideos(directoryHandle) {
    try {
        console.log('🔍 Scanning for videos...');
        
        // Use file access manager to scan
        const videos = await window.fileAccessManager.scanForVideos(directoryHandle);
        
        if (videos.length === 0) {
            console.log('ℹ️ No videos found in directory');
            showError('No videos found. Please select a folder with .mp4 files.');
            return [];
        }
        
        console.log(`✅ Found ${videos.length} videos`);
        
        // Generate thumbnails
        console.log('🖼️ Generating thumbnails...');
        const videosWithThumbnails = await window.thumbnailGenerator.generateThumbnailsForVideos(
            videos,
            (current, total) => {
                console.log(`📊 Thumbnail progress: ${current}/${total}`);
                // TODO: Show progress in UI
            }
        );
        
        console.log('✅ Thumbnails generated');
        
        // Add to app state - this will trigger video grid to update
        window.appState.addVideosToLibrary(videosWithThumbnails);
        
        return videosWithThumbnails;
        
    } catch (error) {
        console.error('❌ Error scanning videos:', error);
        showError('Failed to scan videos: ' + error.message);
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
                duration: video.duration * 1000, // Convert to milliseconds
                width: video.videoWidth,
                height: video.videoHeight,
                resolution: `${video.videoWidth}x${video.videoHeight}`
            });
            
            URL.revokeObjectURL(video.src);
        };
        
        video.onerror = () => {
            resolve({
                duration: 0,
                width: 0,
                height: 0,
                resolution: 'Unknown'
            });
        };
        
        video.src = URL.createObjectURL(file);
    });
}

/**
 * Called when VR session starts
 */
function onVRSessionStart() {
    // Enable VR-specific features
    document.body.classList.add('vr-active');
    
    // Show help panel briefly
    setTimeout(() => {
        const helpPanel = document.getElementById('help-panel');
        if (helpPanel) {
            helpPanel.setAttribute('visible', 'true');
            
            // Hide after 5 seconds
            setTimeout(() => {
                helpPanel.setAttribute('visible', 'false');
            }, 5000);
        }
    }, 1000);
}

/**
 * Called when VR session ends
 */
function onVRSessionEnd() {
    document.body.classList.remove('vr-active');
    
    // Pause any playing video
    if (window.appState.playback.isPlaying) {
        window.appState.setPlaybackState(false);
    }
}

/**
 * Setup state change listeners
 */
function setupStateListeners() {
    // Listen for video selection
    window.appState.subscribe('currentVideo', (video) => {
        if (video) {
            console.log('📹 Video selected:', video.name);
            // Video panel component will handle loading
        }
    });
    
    // Listen for export completion
    window.appState.subscribe('exportProgress', (progress) => {
        if (progress.progress === 100) {
            console.log('✅ Export complete!');
            showSuccess('Video exported successfully!');
        }
    });
}

/**
 * Show error message
 */
function showError(message) {
    console.error('❌', message);
    
    // TODO: Show in VR UI if in VR mode
    // For now, just log and potentially show in overlay
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message show';
    errorDiv.textContent = message;
    document.querySelector('.splash-screen')?.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

/**
 * Show success message
 */
function showSuccess(message) {
    console.log('✅', message);
    // TODO: Show in VR UI
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showError('An error occurred: ' + event.error.message);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showError('An error occurred: ' + event.reason);
});

console.log('✅ Main.js loaded');
