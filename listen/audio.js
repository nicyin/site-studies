let hasStarted = false;

class AudioProcessor {
    static audioContext = null;
    static stream = null;
    static hasPermission = false;

    constructor() {
        this.analyser = null;
        this.microphone = null;
        this.isInitialized = false;
        this.silenceTimeout = null;
        this.SILENCE_THRESHOLD = 30;
        this.SILENCE_DURATION = 5000; 
    }

    async initialize() {
        try {
            // request permission
            if (!AudioProcessor.hasPermission) {
                AudioProcessor.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                AudioProcessor.hasPermission = true;
            }

            // create/resume audio
            if (!AudioProcessor.audioContext) {
                AudioProcessor.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } else if (AudioProcessor.audioContext.state === 'suspended') {
                await AudioProcessor.audioContext.resume();
            }

            this.analyser = AudioProcessor.audioContext.createAnalyser();
            this.analyser.fftSize = 256;

            this.microphone = AudioProcessor.audioContext.createMediaStreamSource(AudioProcessor.stream);
            this.microphone.connect(this.analyser);
            
            this.isInitialized = true;

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
        if (AudioProcessor.audioContext) {
            AudioProcessor.audioContext.suspend();
        }
        this.isInitialized = false;
    }

    monitorVolume() {
        if (!this.isInitialized) return;

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        let animationFrame;
        
        const checkVolume = () => {
            if (!this.isInitialized) return; 
            
            this.analyser.getByteFrequencyData(dataArray);

            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            console.log('Audio value:', Math.round(average));

            const event = new CustomEvent('volumeChange', {
                detail: { 
                    volume: average,
                    normalized: average / 255 
                }
            });
            window.dispatchEvent(event);

            if (average < this.SILENCE_THRESHOLD) {
                if (!this.silenceTimeout) {
                    this.silenceTimeout = setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('silence'));
                        this.silenceTimeout = null;
                    }, this.SILENCE_DURATION);
                }
            } else {
                if (this.silenceTimeout) {
                    clearTimeout(this.silenceTimeout);
                    this.silenceTimeout = null;
                }
            }

            animationFrame = requestAnimationFrame(checkVolume);
        };

        checkVolume();
    }
}

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
            
            window.bubbleAnim.createBubble();
        } else {
            alert('Could not access microphone. Please ensure you have given permission and reload the page.');
        }
    });
});