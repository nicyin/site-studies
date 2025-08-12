// Shared state
let hasStarted = false;

class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.isInitialized = false;
        this.silenceTimeout = null;
        this.SILENCE_THRESHOLD = 50; //change this back after testing
        this.SILENCE_DURATION = 5000; 
    }

    async initialize() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Create analyser node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            
            // Connect microphone to analyser
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);
            
            this.isInitialized = true;
            
            // Start monitoring volume
            this.monitorVolume();
            
            return true;
        } catch (error) {
            console.error('Error initializing audio:', error);
            return false;
        }
    }

    cleanup() {
        if (this.microphone) {
            this.microphone.disconnect();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.isInitialized = false;
    }

    monitorVolume() {
        if (!this.isInitialized) return;

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        let animationFrame;
        
        const checkVolume = () => {
            if (!this.isInitialized) return;  // Stop if we're no longer initialized
            
            this.analyser.getByteFrequencyData(dataArray);
            
            // Calculate average volume
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            console.log('Audio value:', Math.round(average));
            
            // Dispatch custom event with volume data
            const event = new CustomEvent('volumeChange', {
                detail: { 
                    volume: average,
                    normalized: average / 255  // Normalized value between 0 and 1
                }
            });
            window.dispatchEvent(event);

            // Check for silence
            if (average < this.SILENCE_THRESHOLD) {
                if (!this.silenceTimeout) {
                    this.silenceTimeout = setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('silence'));
                        this.silenceTimeout = null;
                        // Stop monitoring and cleanup
                        cancelAnimationFrame(animationFrame);
                        this.cleanup();
                        // Show start overlay again
                        setTimeout(() => {
                            const startOverlay = document.getElementById('start-overlay');
                            const bubbleContainer = document.getElementById('bubble-container');
                            
                            if (startOverlay) startOverlay.style.display = 'flex';
                            if (bubbleContainer) bubbleContainer.style.display = 'none';
                            
                            // Reset the hasStarted flag
                            hasStarted = false;
                            // Dispatch event to reset bubble animation
                            window.dispatchEvent(new CustomEvent('bubbleReset'));
                        }, 1000); // Wait for pop animation to complete
                    }, this.SILENCE_DURATION);
                }
            } else {
                if (this.silenceTimeout) {
                    clearTimeout(this.silenceTimeout);
                    this.silenceTimeout = null;
                }
            }

            // Continue monitoring
            animationFrame = requestAnimationFrame(checkVolume);
        };

        checkVolume();
    }
}

// Initialize on any click/tap
document.addEventListener('DOMContentLoaded', () => {
    const startOverlay = document.getElementById('start-overlay');
    const bubbleContainer = document.getElementById('bubble-container');

    startOverlay.addEventListener('click', async () => {
        if (hasStarted) return;
        hasStarted = true;

        const processor = new AudioProcessor();
        const success = await processor.initialize();
        
        if (success) {
            startOverlay.style.display = 'none';
            bubbleContainer.style.display = 'flex';
        } else {
            alert('Could not access microphone. Please ensure you have given permission and reload the page.');
        }
    });
});