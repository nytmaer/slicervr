/**
 * Global Application State Management
 * Centralized state for the VR video editor
 */

class AppState {
    constructor() {
        // Current video being edited
        this.currentVideo = null;
        
        // Video library
        this.videoLibrary = [];
        
        // Trim range (in milliseconds)
        this.trimRange = {
            start: 0,
            end: 0
        };
        
        // Playback state
        this.playback = {
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            volume: 1.0
        };
        
        // Export settings
        this.exportSettings = {
            quality: 'medium', // 'light', 'medium', 'strong'
            format: 'mp4',     // 'mp4', 'gif'
            estimatedSize: 0
        };
        
        // Export progress
        this.exportProgress = {
            isExporting: false,
            progress: 0,
            status: ''
        };
        
        // UI state
        this.ui = {
            selectedPanel: 'video-library', // 'video-library', 'player', 'export'
            helpVisible: false
        };
        
        // Listeners for state changes
        this.listeners = new Map();
    }
    
    /**
     * Subscribe to state changes
     */
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
    }
    
    /**
     * Notify listeners of state change
     */
    notify(key) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => callback(this[key]));
        }
    }
    
    /**
     * Set current video
     */
    setCurrentVideo(video) {
        this.currentVideo = video;
        
        // Reset trim range to full video
        if (video) {
            this.trimRange.start = 0;
            this.trimRange.end = video.duration;
            this.playback.duration = video.duration;
            this.playback.currentTime = 0;
        }
        
        this.notify('currentVideo');
        this.notify('trimRange');
    }
    
    /**
     * Update trim range
     */
    setTrimRange(start, end) {
        this.trimRange.start = Math.max(0, start);
        this.trimRange.end = Math.min(this.playback.duration, end);
        this.notify('trimRange');
        this.calculateEstimatedSize();
    }
    
    /**
     * Update playback state
     */
    setPlaybackState(isPlaying) {
        this.playback.isPlaying = isPlaying;
        this.notify('playback');
    }
    
    /**
     * Update current playback time
     */
    setCurrentTime(time) {
        this.playback.currentTime = time;
        this.notify('playback');
    }
    
    /**
     * Set export quality
     */
    setExportQuality(quality) {
        this.exportSettings.quality = quality;
        this.notify('exportSettings');
        this.calculateEstimatedSize();
    }
    
    /**
     * Set export format
     */
    setExportFormat(format) {
        this.exportSettings.format = format;
        this.notify('exportSettings');
        this.calculateEstimatedSize();
    }
    
    /**
     * Calculate estimated output size
     */
    calculateEstimatedSize() {
        if (!this.currentVideo) return;
        
        const trimDuration = this.trimRange.end - this.trimRange.start;
        const durationRatio = trimDuration / this.currentVideo.duration;
        const baseSize = this.currentVideo.size * durationRatio;
        
        // Quality multipliers
        const qualityMultipliers = {
            light: 0.7,
            medium: 0.5,
            strong: 0.3
        };
        
        // Format multipliers
        const formatMultipliers = {
            mp4: 1.0,
            gif: 2.5  // GIFs are typically larger
        };
        
        const qualityFactor = qualityMultipliers[this.exportSettings.quality];
        const formatFactor = formatMultipliers[this.exportSettings.format];
        
        this.exportSettings.estimatedSize = Math.round(baseSize * qualityFactor * formatFactor);
        this.notify('exportSettings');
    }
    
    /**
     * Set export progress
     */
    setExportProgress(progress, status = '') {
        this.exportProgress.progress = progress;
        this.exportProgress.status = status;
        this.notify('exportProgress');
    }
    
    /**
     * Start export
     */
    startExport() {
        this.exportProgress.isExporting = true;
        this.exportProgress.progress = 0;
        this.notify('exportProgress');
    }
    
    /**
     * Complete export
     */
    completeExport() {
        this.exportProgress.isExporting = false;
        this.exportProgress.progress = 100;
        this.notify('exportProgress');
    }
    
    /**
     * Add videos to library
     */
    addVideosToLibrary(videos) {
        this.videoLibrary = videos;
        this.notify('videoLibrary');
    }
    
    /**
     * Toggle help panel
     */
    toggleHelp() {
        this.ui.helpVisible = !this.ui.helpVisible;
        this.notify('ui');
    }
    
    /**
     * Format file size for display
     */
    static formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
    
    /**
     * Format time for display (MM:SS)
     */
    static formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Create global instance
window.appState = new AppState();

console.log('✅ App State initialized');
