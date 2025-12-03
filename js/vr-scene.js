/**
 * VR Scene Management
 * Handles VR-specific interactions and scene updates
 */

// Wait for A-Frame to be ready
AFRAME.registerComponent('clipcut-scene', {
    init: function() {
        console.log('🎮 VR Scene component initialized');
        
        this.setupClickHandlers();
        this.setupDragHandlers();
        this.setupControllerListeners();
    },
    
    /**
     * Setup click handlers for all interactive elements
     */
    setupClickHandlers() {
        const scene = this.el;
        
        // Browse Files button
        const browseButton = document.getElementById('browse-button');
        if (browseButton) {
            browseButton.addEventListener('click', async () => {
                console.log('📁 Browse files clicked');
                // Trigger file picker
                await requestFileAccess();
            });
        }
        
        // Play/Pause button
        const playButton = document.getElementById('play-button');
        if (playButton) {
            playButton.addEventListener('click', () => {
                const isPlaying = window.appState.playback.isPlaying;
                window.appState.setPlaybackState(!isPlaying);
                
                // Update button text
                const buttonText = playButton.querySelector('a-text');
                if (buttonText) {
                    buttonText.setAttribute('value', isPlaying ? 'PLAY' : 'PAUSE');
                }
            });
        }
        
        // Export button
        const exportButton = document.getElementById('export-button');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                console.log('📤 Export clicked');
                // Trigger export
                if (window.videoProcessor) {
                    window.videoProcessor.exportVideo();
                }
            });
        }
        
        // Quality buttons
        ['light', 'medium', 'strong'].forEach(quality => {
            const button = document.getElementById(`quality-${quality}`);
            if (button) {
                button.addEventListener('click', () => {
                    window.appState.setExportQuality(quality);
                    this.highlightButton(button);
                });
            }
        });
        
        // Format buttons
        ['mp4', 'gif'].forEach(format => {
            const button = document.getElementById(`format-${format}`);
            if (button) {
                button.addEventListener('click', () => {
                    window.appState.setExportFormat(format);
                    this.highlightButton(button);
                });
            }
        });
    },
    
    /**
     * Setup drag handlers for timeline handles
     */
    setupDragHandlers() {
        const trimStart = document.getElementById('trim-start');
        const trimEnd = document.getElementById('trim-end');
        
        if (trimStart) {
            this.makeElementDraggable(trimStart, 'start');
        }
        
        if (trimEnd) {
            this.makeElementDraggable(trimEnd, 'end');
        }
    },
    
    /**
     * Make an element draggable with controllers
     */
    makeElementDraggable(element, type) {
        let isDragging = false;
        let startX = 0;
        
        element.addEventListener('gripdown', (evt) => {
            isDragging = true;
            startX = evt.detail.position.x;
        });
        
        element.addEventListener('gripup', () => {
            isDragging = false;
        });
        
        // Update position while dragging
        element.addEventListener('componentchanged', (evt) => {
            if (isDragging && evt.detail.name === 'position') {
                const position = evt.detail.newData;
                this.updateTrimHandle(type, position.x);
            }
        });
    },
    
    /**
     * Update trim range based on handle position
     */
    updateTrimHandle(type, xPosition) {
        // Timeline is 3m wide, centered at x=0
        // So x ranges from -1.5 to 1.5
        const timelineWidth = 3;
        const normalizedX = (xPosition + timelineWidth / 2) / timelineWidth;
        
        // Convert to milliseconds
        const duration = window.appState.playback.duration;
        const time = normalizedX * duration;
        
        if (type === 'start') {
            window.appState.setTrimRange(time, window.appState.trimRange.end);
        } else {
            window.appState.setTrimRange(window.appState.trimRange.start, time);
        }
    },
    
    /**
     * Setup controller-specific listeners
     */
    setupControllerListeners() {
        const leftHand = document.getElementById('left-hand');
        const rightHand = document.getElementById('right-hand');
        
        // Thumbstick for scrubbing
        if (rightHand) {
            rightHand.addEventListener('thumbstickmoved', (evt) => {
                const x = evt.detail.x;
                if (Math.abs(x) > 0.2) {
                    // Scrub video
                    const currentTime = window.appState.playback.currentTime;
                    const seekAmount = x * 1000; // Milliseconds
                    const newTime = Math.max(0, Math.min(window.appState.playback.duration, currentTime + seekAmount));
                    window.appState.setCurrentTime(newTime);
                }
            });
        }
        
        // Button mappings
        if (leftHand) {
            leftHand.addEventListener('abuttondown', () => {
                // Toggle help
                window.appState.toggleHelp();
            });
        }
    },
    
    /**
     * Highlight selected button
     */
    highlightButton(button) {
        // Remove highlight from siblings
        const siblings = button.parentElement.querySelectorAll('a-box');
        siblings.forEach(sib => {
            sib.setAttribute('material', 'emissive', '#000000');
        });
        
        // Highlight selected
        button.setAttribute('material', 'emissive', '#FFFFFF');
        button.setAttribute('material', 'emissiveIntensity', '0.3');
    },
    
    /**
     * Update loop
     */
    tick(time, timeDelta) {
        // Update playhead position if playing
        if (window.appState.playback.isPlaying) {
            this.updatePlayhead();
        }
        
        // Update timestamp display
        this.updateTimestamp();
        
        // Update size estimate display
        this.updateSizeEstimate();
    },
    
    /**
     * Update playhead position on timeline
     */
    updatePlayhead() {
        const playhead = document.getElementById('playhead');
        if (!playhead) return;
        
        const currentTime = window.appState.playback.currentTime;
        const duration = window.appState.playback.duration;
        
        if (duration === 0) return;
        
        // Timeline is 3m wide, centered at x=0
        const timelineWidth = 3;
        const normalizedTime = currentTime / duration;
        const xPosition = (normalizedTime * timelineWidth) - (timelineWidth / 2);
        
        playhead.setAttribute('position', {x: xPosition, y: 0, z: 0.02});
    },
    
    /**
     * Update timestamp display
     */
    updateTimestamp() {
        const timestamp = document.getElementById('timestamp');
        if (!timestamp) return;
        
        const current = AppState.formatTime(window.appState.playback.currentTime);
        const total = AppState.formatTime(window.appState.playback.duration);
        
        timestamp.setAttribute('value', `${current} / ${total}`);
    },
    
    /**
     * Update size estimate display
     */
    updateSizeEstimate() {
        const sizeEstimate = document.getElementById('size-estimate');
        if (!sizeEstimate) return;
        
        const size = AppState.formatFileSize(window.appState.exportSettings.estimatedSize);
        sizeEstimate.setAttribute('value', `Est. Size: ${size}`);
    }
});

// Register the component
const scene = document.getElementById('scene');
if (scene) {
    scene.setAttribute('clipcut-scene', '');
}

console.log('✅ VR Scene initialized');
