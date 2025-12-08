/**
 * File Access Utility
 * Handles File System Access API for Quest video browsing
 */

// File size tier constants
const FILE_SIZE_LIMITS = {
    SAFE: 200 * 1024 * 1024,      // 200 MB
    WARNING: 500 * 1024 * 1024,   // 500 MB
    BLOCKED: 500 * 1024 * 1024    // 500 MB (same as WARNING limit)
};

class FileAccessManager {
    constructor() {
        this.directoryHandle = null;
        this.hasPermission = false;
    }
    
    /**
     * Check if File System Access API is supported
     */
    isSupported() {
        return 'showDirectoryPicker' in window;
    }
    
    /**
     * Request directory access from user
     */
    async requestDirectoryAccess() {
        try {
            if (!this.isSupported()) {
                throw new Error('File System Access API not supported in this browser');
            }
            
            console.log('📁 Requesting directory access...');
            
            // Show directory picker
            this.directoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'downloads'
            });
            
            this.hasPermission = true;
            console.log('✅ Directory access granted:', this.directoryHandle.name);
            
            return this.directoryHandle;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('ℹ️ User cancelled directory selection');
            } else {
                console.error('❌ Error requesting directory access:', error);
            }
            throw error;
        }
    }
    
    /**
     * Check file size and assign tier
     */
    checkFileSizeTier(fileSize) {
        if (fileSize >= FILE_SIZE_LIMITS.BLOCKED) {
            return {
                tier: 'BLOCKED',
                color: '#ff4444',
                icon: '🚫',
                canLoad: false
            };
        } else if (fileSize >= FILE_SIZE_LIMITS.WARNING) {
            return {
                tier: 'WARNING',
                color: '#ffaa00',
                icon: '⚠️',
                canLoad: true
            };
        } else {
            return {
                tier: 'SAFE',
                color: '#44ff44',
                icon: '✅',
                canLoad: true
            };
        }
    }
    
    /**
     * Scan directory for video files
     */
    async scanForVideos(dirHandle = null) {
        try {
            const handleToScan = dirHandle || this.directoryHandle;
            
            if (!handleToScan) {
                throw new Error('No directory handle available');
            }
            
            console.log('🔍 Scanning for videos...');
            const videos = [];
            
            // Iterate through directory entries
            for await (const entry of handleToScan.values()) {
                if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.mp4')) {
                    try {
                        const file = await entry.getFile();
                        const sizeTier = this.checkFileSizeTier(file.size);
                        
                        videos.push({
                            name: file.name,
                            size: file.size,
                            sizeFormatted: window.appState.constructor.formatFileSize(file.size),
                            lastModified: file.lastModified,
                            fileHandle: entry,
                            file: file,
                            url: URL.createObjectURL(file),
                            duration: 0, // Will be populated when loaded
                            thumbnail: null, // Will be generated later
                            sizeTier: sizeTier.tier,
                            tierColor: sizeTier.color,
                            tierIcon: sizeTier.icon,
                            canLoad: sizeTier.canLoad
                        });
                        
                        console.log(`📹 Found: ${file.name} (${window.appState.constructor.formatFileSize(file.size)}) - ${sizeTier.tier}`);
                        
                    } catch (error) {
                        console.warn(`⚠️ Could not access file ${entry.name}:`, error);
                    }
                }
            }
            
            // Sort by last modified (newest first)
            videos.sort((a, b) => b.lastModified - a.lastModified);
            
            console.log(`✅ Found ${videos.length} videos`);
            return videos;
            
        } catch (error) {
            console.error('❌ Error scanning directory:', error);
            throw error;
        }
    }
    
    /**
     * Get video metadata (duration, resolution)
     */
    async getVideoMetadata(videoFile) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            
            video.addEventListener('loadedmetadata', () => {
                const metadata = {
                    duration: video.duration * 1000, // Convert to ms
                    width: video.videoWidth,
                    height: video.videoHeight,
                    aspectRatio: video.videoWidth / video.videoHeight
                };
                
                // Clean up
                URL.revokeObjectURL(video.src);
                
                resolve(metadata);
            });
            
            video.addEventListener('error', () => {
                URL.revokeObjectURL(video.src);
                reject(new Error('Failed to load video metadata'));
            });
            
            video.src = URL.createObjectURL(videoFile);
        });
    }
    
    /**
     * Verify permission to directory
     */
    async verifyPermission(handle, readWrite = true) {
        const options = readWrite ? { mode: 'readwrite' } : { mode: 'read' };
        
        // Check if we have permission
        if ((await handle.queryPermission(options)) === 'granted') {
            return true;
        }
        
        // Request permission
        if ((await handle.requestPermission(options)) === 'granted') {
            return true;
        }
        
        return false;
    }
    
    /**
     * Save file to directory
     */
    async saveFile(fileName, blob) {
        try {
            if (!this.directoryHandle) {
                throw new Error('No directory access');
            }
            
            // Verify we still have permission
            const hasPermission = await this.verifyPermission(this.directoryHandle);
            if (!hasPermission) {
                throw new Error('Permission denied');
            }
            
            console.log(`💾 Saving file: ${fileName}`);
            
            // Create file handle
            const fileHandle = await this.directoryHandle.getFileHandle(fileName, { create: true });
            
            // Create writable stream
            const writable = await fileHandle.createWritable();
            
            // Write the file
            await writable.write(blob);
            await writable.close();
            
            console.log(`✅ File saved: ${fileName}`);
            return fileHandle;
            
        } catch (error) {
            console.error('❌ Error saving file:', error);
            throw error;
        }
    }
    
    /**
     * Clean up object URLs to prevent memory leaks
     */
    cleanupObjectURL(url) {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    }
    
    /**
     * Clean up all video object URLs
     */
    cleanupAllVideos(videos) {
        videos.forEach(video => {
            this.cleanupObjectURL(video.url);
            this.cleanupObjectURL(video.thumbnail);
        });
    }
}

// Create global instance
window.fileAccessManager = new FileAccessManager();

console.log('✅ File access utility loaded');
