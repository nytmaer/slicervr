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
        if (!window.showDirectoryPicker) {
            console.warn('⚠️ File System Access API not supported');
            // Fallback to file input
            return true; // Allow to proceed, will use fallback
        }
        
        console.log('📁 Requesting file access...');
        
        // Request access to Quest recordings directory
        // On Quest, this would be /DCIM/Meta Quest/
        const directoryHandle = await window.showDirectoryPicker({
            mode: 'read',
            startIn: 'videos' // Suggest starting in videos directory
        });
        
        // Store directory handle for later use
        window.questDirectory = directoryHandle;
        
        console.log('✅ File access granted:', directoryHandle.name);
        
        // Scan for videos
        await scanForVideos(directoryHandle);
        
        return true;
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('User cancelled file access');
            return false;
        }
        console.error('File access error:', error);
        return false;
    }
}

/**
 * Scan directory for video files
 */
async function scanForVideos(directoryHandle) {
    try {
        console.log('🔍 Scanning for videos...');
        const videos = [];
        
        for await (const entry of directoryHandle.values()) {
            if (entry.kind === 'file') {
                const file = await entry.getFile();
                
                // Check if it's a video file
                if (file.type.startsWith('video/')) {
                    // Create video metadata
                    const videoData = {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified,
                        file: file,
                        url: URL.createObjectURL(file)
                    };
                    
                    // Extract duration and resolution
                    const metadata = await extractVideoMetadata(file);
                    Object.assign(videoData, metadata);
                    
                    videos.push(videoData);
                }
            }
        }
        
        console.log(`✅ Found ${videos.length} videos`);
        
        // Add to app state
        window.appState.addVideosToLibrary(videos);
        
        return videos;
        
    } catch (error) {
        console.error('Error scanning videos:', error);
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
