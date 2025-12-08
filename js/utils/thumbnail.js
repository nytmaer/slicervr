/**
 * Thumbnail Generator
 * Creates video thumbnails using Canvas API
 */

class ThumbnailGenerator {
    constructor() {
        this.thumbnailWidth = 320;
        this.thumbnailHeight = 180;
        this.thumbnailQuality = 0.8;
        this.maxConcurrent = 3; // Limit concurrent generations
        this.queue = [];
        this.activeGenerations = 0;
    }
    
    /**
     * Generate thumbnail from video file
     * @param {File} videoFile - The video file to extract from
     * @param {number} timeSeconds - Time in seconds to extract frame (default: 1)
     * @returns {Promise<string>} - Blob URL of thumbnail image
     */
    async generateThumbnail(videoFile, timeSeconds = 1) {
        return new Promise((resolve, reject) => {
            console.log(`🖼️ Generating thumbnail for ${videoFile.name}...`);
            
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.muted = true;
            video.playsInline = true;
            
            // Set up video element
            const videoURL = URL.createObjectURL(videoFile);
            video.src = videoURL;
            
            let thumbnailURL = null;
            let hasResolved = false;
            
            const cleanup = () => {
                URL.revokeObjectURL(videoURL);
                video.remove();
            };
            
            const resolveOnce = (result) => {
                if (!hasResolved) {
                    hasResolved = true;
                    cleanup();
                    resolve(result);
                }
            };
            
            const rejectOnce = (error) => {
                if (!hasResolved) {
                    hasResolved = true;
                    cleanup();
                    reject(error);
                }
            };
            
            // Handle video loaded
            video.addEventListener('loadedmetadata', () => {
                // Clamp time to video duration
                const seekTime = Math.min(timeSeconds, Math.max(0, video.duration - 0.1));
                video.currentTime = seekTime;
            });
            
            // Handle seek complete
            video.addEventListener('seeked', () => {
                try {
                    // Create canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = this.thumbnailWidth;
                    canvas.height = this.thumbnailHeight;
                    
                    const ctx = canvas.getContext('2d');
                    
                    // Calculate dimensions to maintain aspect ratio
                    const videoAspect = video.videoWidth / video.videoHeight;
                    const targetAspect = this.thumbnailWidth / this.thumbnailHeight;
                    
                    let drawWidth, drawHeight, offsetX, offsetY;
                    
                    if (videoAspect > targetAspect) {
                        // Video is wider - fit height
                        drawHeight = this.thumbnailHeight;
                        drawWidth = drawHeight * videoAspect;
                        offsetX = (this.thumbnailWidth - drawWidth) / 2;
                        offsetY = 0;
                    } else {
                        // Video is taller - fit width
                        drawWidth = this.thumbnailWidth;
                        drawHeight = drawWidth / videoAspect;
                        offsetX = 0;
                        offsetY = (this.thumbnailHeight - drawHeight) / 2;
                    }
                    
                    // Fill background with black
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, this.thumbnailWidth, this.thumbnailHeight);
                    
                    // Draw video frame
                    ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
                    
                    // Convert to blob
                    canvas.toBlob((blob) => {
                        if (blob) {
                            thumbnailURL = URL.createObjectURL(blob);
                            console.log(`✅ Thumbnail generated for ${videoFile.name}`);
                            resolveOnce(thumbnailURL);
                        } else {
                            rejectOnce(new Error('Failed to create thumbnail blob'));
                        }
                    }, 'image/jpeg', this.thumbnailQuality);
                    
                } catch (error) {
                    console.error('❌ Error generating thumbnail:', error);
                    rejectOnce(error);
                }
            });
            
            // Handle errors
            video.addEventListener('error', (e) => {
                console.error('❌ Video loading error:', e);
                rejectOnce(new Error('Failed to load video for thumbnail'));
            });
            
            // Timeout after 10 seconds
            setTimeout(() => {
                rejectOnce(new Error('Thumbnail generation timeout'));
            }, 10000);
        });
    }
    
    /**
     * Generate thumbnails for multiple videos with concurrency limit
     * @param {Array} videos - Array of video objects
     * @param {Function} onProgress - Progress callback (current, total)
     * @returns {Promise<Array>} - Array of videos with thumbnails added
     */
    async generateThumbnailsForVideos(videos, onProgress = null) {
        console.log(`🖼️ Generating thumbnails for ${videos.length} videos...`);
        
        const results = [];
        let completed = 0;
        
        // Process videos in batches
        for (let i = 0; i < videos.length; i += this.maxConcurrent) {
            const batch = videos.slice(i, i + this.maxConcurrent);
            
            // Generate thumbnails for this batch in parallel
            const batchPromises = batch.map(async (video) => {
                try {
                    const thumbnailURL = await this.generateThumbnail(video.file, 1);
                    video.thumbnail = thumbnailURL;
                    completed++;
                    
                    if (onProgress) {
                        onProgress(completed, videos.length);
                    }
                    
                    return video;
                } catch (error) {
                    console.error(`⚠️ Failed to generate thumbnail for ${video.name}:`, error);
                    video.thumbnail = null;
                    completed++;
                    
                    if (onProgress) {
                        onProgress(completed, videos.length);
                    }
                    
                    return video;
                }
            });
            
            // Wait for this batch to complete
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }
        
        console.log(`✅ Generated ${completed} thumbnails`);
        return results;
    }
    
    /**
     * Generate placeholder thumbnail (for errors)
     * @returns {string} - Data URL of placeholder
     */
    generatePlaceholder() {
        const canvas = document.createElement('canvas');
        canvas.width = this.thumbnailWidth;
        canvas.height = this.thumbnailHeight;
        
        const ctx = canvas.getContext('2d');
        
        // Dark background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, this.thumbnailWidth, this.thumbnailHeight);
        
        // Play icon
        ctx.fillStyle = '#666666';
        ctx.beginPath();
        ctx.moveTo(this.thumbnailWidth / 2 - 20, this.thumbnailHeight / 2 - 30);
        ctx.lineTo(this.thumbnailWidth / 2 - 20, this.thumbnailHeight / 2 + 30);
        ctx.lineTo(this.thumbnailWidth / 2 + 30, this.thumbnailHeight / 2);
        ctx.closePath();
        ctx.fill();
        
        return canvas.toDataURL('image/jpeg', this.thumbnailQuality);
    }
}

// Create global instance
window.thumbnailGenerator = new ThumbnailGenerator();

console.log('✅ Thumbnail generator loaded');
