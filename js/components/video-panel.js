/**
 * Video Panel Component
 * Handles video playback in VR
 */

(function() {
    'use strict';
    
    class VideoPanel {
        constructor() {
            this.videoElement = null;
            this.videoMaterial = null;
            this.isInitialized = false;
            
            this.init();
        }
        
        init() {
            console.log('🎥 Video Panel initializing...');
            
            // Listen for video selection
            window.appState.subscribe('currentVideo', (video) => {
                if (video) {
                    this.loadVideo(video);
                }
            });
            
            // Listen for playback state changes
            window.appState.subscribe('playback', (playback) => {
                if (this.videoElement) {
                    if (playback.isPlaying) {
                        this.videoElement.play();
                    } else {
                        this.videoElement.pause();
                    }
                }
            });
            
            console.log('✅ Video Panel initialized');
        }
        
        /**
         * Load video into player
         */
        async loadVideo(videoData) {
            try {
                console.log('📹 Loading video:', videoData.name);
                
                // Create video element if it doesn't exist
                if (!this.videoElement) {
                    this.videoElement = document.createElement('video');
                    this.videoElement.setAttribute('crossorigin', 'anonymous');
                    this.videoElement.setAttribute('playsinline', '');
                    this.videoElement.setAttribute('webkit-playsinline', '');
                    this.videoElement.loop = false;
                    
                    // Add to assets
                    const assets = document.querySelector('a-assets');
                    this.videoElement.id = 'current-video';
                    assets.appendChild(this.videoElement);
                }
                
                // Set video source
                this.videoElement.src = videoData.url;
                
                // Wait for video to load
                await new Promise((resolve, reject) => {
                    this.videoElement.addEventListener('loadedmetadata', resolve, { once: true });
                    this.videoElement.addEventListener('error', reject, { once: true });
                });
                
                // Create video material
                const videoScreen = document.getElementById('video-screen');
                if (videoScreen) {
                    videoScreen.setAttribute('material', {
                        src: '#current-video',
                        shader: 'flat'
                    });
                }
                
                // Update app state
                window.appState.playback.duration = videoData.duration;
                window.appState.setTrimRange(0, videoData.duration);
                
                // Listen for time updates
                this.videoElement.addEventListener('timeupdate', () => {
                    window.appState.setCurrentTime(this.videoElement.currentTime * 1000);
                });
                
                // Listen for end
                this.videoElement.addEventListener('ended', () => {
                    window.appState.setPlaybackState(false);
                });
                
                this.isInitialized = true;
                console.log('✅ Video loaded successfully');
                
            } catch (error) {
                console.error('❌ Error loading video:', error);
            }
        }
        
        /**
         * Seek to position
         */
        seekTo(timeMs) {
            if (this.videoElement) {
                this.videoElement.currentTime = timeMs / 1000;
            }
        }
        
        /**
         * Set volume
         */
        setVolume(volume) {
            if (this.videoElement) {
                this.videoElement.volume = Math.max(0, Math.min(1, volume));
            }
        }
    }
    
    // Create global instance
    window.videoPanel = new VideoPanel();
    
})();
