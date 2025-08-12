class BubbleAnimation {
    constructor() {
        this.maxScale = 3;
        this.currentBubble = null;
        this.animationFrame = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('volumeChange', (event) => {
            const { volume, normalized } = event.detail;
            if (volume > 15 && !this.currentBubble) {
                this.createBubble();
            }
            // Scale current bubble based on volume
            if (this.currentBubble) {
                const scale = 0.8 + (normalized * 4); // Scale between 0.8x and 4.8x size
                const currentTransform = this.currentBubble.style.transform;
                
                // Extract current transform values
                const translateMatch = currentTransform.match(/translate\(([-\d.]+px),\s*([-\d.]+px)\)/);
                const rotateMatch = currentTransform.match(/rotate\(([-\d.]+)deg\)/);
                
                if (translateMatch) {
                    const [_, translateX, translateY] = translateMatch;
                    const rotation = rotateMatch ? rotateMatch[1] : '0';
                    this.currentBubble.style.transform = `translate(${translateX}, ${translateY}) rotate(${rotation}deg) scale(${scale})`;
                }
            }
        });

        window.addEventListener('silence', () => {
            if (this.currentBubble) {
                this.popBubble();
            }
        });
    }

    createBubble() {
        // Create new bubble
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        document.getElementById('bubble-container').appendChild(bubble);
        this.currentBubble = bubble;

        // Set initial position at bottom of viewport
        const startX = Math.random() * (window.innerWidth - 100);
        bubble.style.position = 'absolute';
        bubble.style.left = `${startX}px`;
        bubble.style.bottom = '0';
        bubble.style.opacity = '0';
        bubble.style.transform = 'translateY(100%)'; // Start just below viewport

        // Generate random control points for the path
        const points = [];
        const numPoints = 5;
        const maxDeviation = window.innerWidth * 0.2; // Max horizontal deviation
        const height = window.innerHeight + 200; // Total travel distance
        
        // Generate points with more natural spacing
        for (let i = 0; i < numPoints; i++) {
            const progress = i / (numPoints - 1);
            points.push({
                x: startX + (Math.random() - 0.5) * maxDeviation * (1 - progress), // Less deviation as it goes up
                y: height * progress // Y position from bottom to top
            });
        }

        // Animation variables
        let startTime = null;
        const duration = 15000; // 15 seconds to float up
        
        // Random rotation parameters
        const rotationSpeed = (Math.random() - 0.5) * 0.2; // Random speed between -1 and 1
        const rotationPhase = Math.random() * Math.PI * 2; // Random starting phase
        const rotationAmplitude = 15 + Math.random() * 15; // Random amplitude between 15 and 30 degrees
        const rotationPeriod = 3000 + Math.random() * 2000; // Random period between 3-5 seconds

        // Animate the bubble
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;
            const time = timestamp - startTime;

            if (progress < 1) {
                // Find the two control points we're between
                const index = Math.floor(progress * (numPoints - 1));
                const t = (progress * (numPoints - 1)) % 1;
                const p1 = points[index];
                const p2 = points[Math.min(index + 1, numPoints - 1)];
                
                // Interpolate between points
                const currentX = p1.x + (p2.x - p1.x) * t;
                const currentY = p1.y + (p2.y - p1.y) * t;
                
                // Add gentle wobble
                const wobbleX = Math.sin(progress * 6) * 15 * (1 - progress); // Wobble reduces as bubble rises
                
                // Calculate rotation
                const baseRotation = rotationSpeed * time; // Steady rotation
                const wobbleRotation = Math.sin((time / rotationPeriod) * Math.PI * 2 + rotationPhase) * rotationAmplitude;
                const rotation = baseRotation + wobbleRotation;
                
                // Update bubble position and rotation (without scale to preserve audio-based scaling)
                const translateX = currentX - startX + wobbleX;
                const translateY = -currentY;
                const currentScale = bubble.style.transform.match(/scale\(([\d.]+)\)/) || [null, '1'];
                bubble.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg) scale(${currentScale[1]})`;
                
                // Fade in at start
                if (progress < 0.1) {
                    bubble.style.opacity = (progress / 0.1).toString();
                } else {
                    bubble.style.opacity = '1';
                }
                
                this.animationFrame = requestAnimationFrame(animate);
            }
        };

        // Start animation
        this.animationFrame = requestAnimationFrame(animate);
    }

    popBubble() {
        if (!this.currentBubble) return;

        // Cancel any ongoing animation
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        const bubble = this.currentBubble;
        const popSound = document.getElementById('pop-sound');
        popSound.currentTime = 0;
        popSound.play();

        // Extract current transform values
        const currentTransform = bubble.style.transform;
        const translateMatch = currentTransform.match(/translate\(([-\d.]+px),\s*([-\d.]+px)\)/);
        const rotateMatch = currentTransform.match(/rotate\(([-\d.]+)deg\)/);
        const scaleMatch = currentTransform.match(/scale\(([\d.]+)\)/);

        // Get current values or defaults
        const translate = translateMatch ? `translate(${translateMatch[1]}, ${translateMatch[2]})` : '';
        const rotate = rotateMatch ? `rotate(${rotateMatch[1]}deg)` : '';
        const currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;

        // Pop animation
        bubble.style.transition = 'all 0.3s ease-out';
        bubble.style.transform = `${translate} ${rotate} scale(${currentScale * 1.2})`;
        bubble.style.opacity = '0';

        // Remove bubble after animation
        setTimeout(() => {
            bubble.remove();
            this.currentBubble = null;
        }, 300);
    }
    }

document.addEventListener('DOMContentLoaded', () => {
    window.bubbleAnim = new BubbleAnimation();
});