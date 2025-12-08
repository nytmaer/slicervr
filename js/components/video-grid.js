/**
 * Video Grid Component
 * Displays video library in 3D grid
 */

(function() {
    'use strict';
    
    class VideoGrid {
        constructor() {
            this.gridContainer = null;
            this.videos = [];
            this.cardsPerRow = 3;
            this.maxVisibleVideos = 9; // 3x3 grid
            this.cardWidth = 0.8;
            this.cardHeight = 0.6;
            this.cardSpacing = 0.1;
            this.isInitialized = false;
            
            this.init();
        }
        
        init() {
            console.log('📚 Video Grid initializing...');
            
            // Get or create grid container
            this.gridContainer = document.getElementById('video-grid');
            
            if (!this.gridContainer) {
                console.error('❌ Video grid container not found in scene');
                return;
            }
            
            // Subscribe to video library changes
            window.appState.subscribe('videoLibrary', (videos) => {
                this.updateGrid(videos);
            });
            
            this.isInitialized = true;
            console.log('✅ Video Grid initialized');
        }
        
        /**
         * Update grid with new videos
         */
        async updateGrid(videos) {
            console.log(`📚 Updating grid with ${videos.length} videos`);
            
            this.videos = videos;
            
            // Clear existing cards
            this.clearGrid();
            
            // Show only first 9 videos (3x3 grid)
            const visibleVideos = videos.slice(0, this.maxVisibleVideos);
            
            // Create cards for each video
            visibleVideos.forEach((video, index) => {
                this.createVideoCard(video, index);
            });
        }
        
        /**
         * Clear all video cards from grid
         */
        clearGrid() {
            while (this.gridContainer.firstChild) {
                this.gridContainer.removeChild(this.gridContainer.firstChild);
            }
        }
        
        /**
         * Calculate card position in 3D space
         */
        getCardPosition(index) {
            const row = Math.floor(index / this.cardsPerRow);
            const col = index % this.cardsPerRow;
            
            const totalWidth = (this.cardWidth + this.cardSpacing) * this.cardsPerRow - this.cardSpacing;
            const totalHeight = (this.cardHeight + this.cardSpacing) * Math.ceil(this.maxVisibleVideos / this.cardsPerRow) - this.cardSpacing;
            
            const x = col * (this.cardWidth + this.cardSpacing) - totalWidth / 2 + this.cardWidth / 2;
            const y = -row * (this.cardHeight + this.cardSpacing) + totalHeight / 2 - this.cardHeight / 2;
            
            return { x, y, z: 0 };
        }
        
        /**
         * Create a video card entity
         */
        createVideoCard(video, index) {
            const position = this.getCardPosition(index);
            
            // Create card container
            const card = document.createElement('a-entity');
            card.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
            card.setAttribute('class', 'video-card');
            card.setAttribute('data-video-index', index);
            
            // Background panel
            const background = document.createElement('a-plane');
            background.setAttribute('width', this.cardWidth);
            background.setAttribute('height', this.cardHeight);
            background.setAttribute('color', '#222222');
            background.setAttribute('shader', 'flat');
            
            // Add hover effect
            background.setAttribute('animation__mouseenter', {
                property: 'color',
                to: '#333333',
                dur: 200,
                startEvents: 'mouseenter'
            });
            background.setAttribute('animation__mouseleave', {
                property: 'color',
                to: '#222222',
                dur: 200,
                startEvents: 'mouseleave'
            });
            
            card.appendChild(background);
            
            // Thumbnail image
            if (video.thumbnail) {
                const thumbnail = document.createElement('a-plane');
                thumbnail.setAttribute('width', this.cardWidth - 0.05);
                thumbnail.setAttribute('height', (this.cardWidth - 0.05) * 9/16); // 16:9 aspect
                thumbnail.setAttribute('position', `0 0.1 0.001`);
                thumbnail.setAttribute('material', {
                    src: video.thumbnail,
                    shader: 'flat'
                });
                card.appendChild(thumbnail);
            }
            
            // Video name text
            const nameText = document.createElement('a-text');
            nameText.setAttribute('value', this.truncateText(video.name, 30));
            nameText.setAttribute('align', 'center');
            nameText.setAttribute('width', this.cardWidth - 0.1);
            nameText.setAttribute('position', `0 -${this.cardHeight/2 - 0.08} 0.002`);
            nameText.setAttribute('color', '#ffffff');
            nameText.setAttribute('shader', 'msdf');
            nameText.setAttribute('font', 'https://cdn.aframe.io/fonts/Roboto-msdf.json');
            card.appendChild(nameText);
            
            // File size badge
            const badgeY = this.cardHeight / 2 - 0.1;
            const badge = this.createBadge(video, badgeY);
            card.appendChild(badge);
            
            // Make card clickable
            card.setAttribute('class', 'clickable video-card');
            card.addEventListener('click', () => {
                this.onCardClick(video);
            });
            
            // Add to grid
            this.gridContainer.appendChild(card);
        }
        
        /**
         * Create file size badge with tier color
         */
        createBadge(video, yPosition) {
            const badge = document.createElement('a-entity');
            badge.setAttribute('position', `0 ${yPosition} 0.002`);
            
            // Badge background
            const badgeBg = document.createElement('a-plane');
            badgeBg.setAttribute('width', '0.35');
            badgeBg.setAttribute('height', '0.08');
            badgeBg.setAttribute('color', video.tierColor);
            badgeBg.setAttribute('shader', 'flat');
            badge.appendChild(badgeBg);
            
            // Badge text
            const badgeText = document.createElement('a-text');
            badgeText.setAttribute('value', `${video.tierIcon} ${video.sizeFormatted}`);
            badgeText.setAttribute('align', 'center');
            badgeText.setAttribute('width', '0.3');
            badgeText.setAttribute('position', '0 0 0.001');
            badgeText.setAttribute('color', '#000000');
            badgeText.setAttribute('shader', 'msdf');
            badgeText.setAttribute('font', 'https://cdn.aframe.io/fonts/Roboto-msdf.json');
            badge.appendChild(badgeText);
            
            return badge;
        }
        
        /**
         * Handle card click
         */
        async onCardClick(video) {
            console.log(`🎬 Video selected: ${video.name}`);
            
            // Check if video is blocked
            if (!video.canLoad) {
                this.showBlockedMessage(video);
                return;
            }
            
            // Show warning for large files
            if (video.sizeTier === 'WARNING') {
                const proceed = await this.showWarningMessage(video);
                if (!proceed) {
                    return;
                }
            }
            
            // Get metadata if not already loaded
            if (video.duration === 0) {
                try {
                    console.log('📊 Loading video metadata...');
                    const metadata = await window.fileAccessManager.getVideoMetadata(video.file);
                    video.duration = metadata.duration;
                    video.width = metadata.width;
                    video.height = metadata.height;
                    console.log(`✅ Metadata loaded: ${metadata.width}x${metadata.height}, ${(metadata.duration/1000).toFixed(1)}s`);
                } catch (error) {
                    console.error('⚠️ Failed to load metadata:', error);
                }
            }
            
            // Set as current video
            window.appState.setCurrentVideo(video);
            
            // Visual feedback (vibration if available)
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
        
        /**
         * Show blocked file message
         */
        showBlockedMessage(video) {
            console.warn(`🚫 File blocked: ${video.name} (${video.sizeFormatted})`);
            
            // Create notification
            this.showNotification(
                '🚫 File Too Large',
                `This video is ${video.sizeFormatted}, exceeding the 500 MB limit.\n\nTo edit:\n• Trim into smaller sections\n• Use desktop editor\n• Record shorter clips`,
                '#ff4444'
            );
        }
        
        /**
         * Show warning for large files
         */
        async showWarningMessage(video) {
            console.warn(`⚠️ Large file warning: ${video.name} (${video.sizeFormatted})`);
            
            // For now, just show warning and continue
            // TODO: Add proper dialog in Phase 6
            this.showNotification(
                '⚠️ Large File Warning',
                `This video is ${video.sizeFormatted}.\n\nProcessing may take 5-10 minutes and could cause crash.\n\nRecommended: Trim to smaller section first.`,
                '#ffaa00',
                3000
            );
            
            return true; // Allow loading for now
        }
        
        /**
         * Show notification message in VR
         */
        showNotification(title, message, color = '#4444ff', duration = 5000) {
            // Create notification panel
            const notification = document.createElement('a-entity');
            notification.setAttribute('position', '0 1.6 -1.5');
            notification.setAttribute('id', 'notification');
            
            // Background
            const bg = document.createElement('a-plane');
            bg.setAttribute('width', '1.2');
            bg.setAttribute('height', '0.6');
            bg.setAttribute('color', color);
            bg.setAttribute('opacity', '0.95');
            notification.appendChild(bg);
            
            // Title
            const titleText = document.createElement('a-text');
            titleText.setAttribute('value', title);
            titleText.setAttribute('align', 'center');
            titleText.setAttribute('width', '1.1');
            titleText.setAttribute('position', '0 0.2 0.01');
            titleText.setAttribute('color', '#ffffff');
            titleText.setAttribute('shader', 'msdf');
            titleText.setAttribute('font', 'https://cdn.aframe.io/fonts/Roboto-msdf.json');
            notification.appendChild(titleText);
            
            // Message
            const messageText = document.createElement('a-text');
            messageText.setAttribute('value', message);
            messageText.setAttribute('align', 'center');
            messageText.setAttribute('width', '1.0');
            messageText.setAttribute('position', '0 -0.05 0.01');
            messageText.setAttribute('color', '#ffffff');
            messageText.setAttribute('wrapCount', '40');
            messageText.setAttribute('shader', 'msdf');
            messageText.setAttribute('font', 'https://cdn.aframe.io/fonts/Roboto-msdf.json');
            notification.appendChild(messageText);
            
            // Add to scene
            const scene = document.querySelector('a-scene');
            scene.appendChild(notification);
            
            // Remove after duration
            if (duration > 0) {
                setTimeout(() => {
                    notification.remove();
                }, duration);
            }
        }
        
        /**
         * Truncate text to max length
         */
        truncateText(text, maxLength) {
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength - 3) + '...';
        }
    }
    
    // Create global instance
    window.videoGrid = new VideoGrid();
    
})();

console.log('✅ Video grid component loaded');
