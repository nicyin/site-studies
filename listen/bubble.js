class BubbleAnimation {
    constructor() {
        this.maxScale = 6;
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('volumeChange', (event) => {
            const { normalized } = event.detail;
            this.updateBubble(normalized);
        });

        window.addEventListener('silence', () => {
            this.popBubble();
        });
    }

    updateBubble(normalizedVolume) {
        const scale = 1 + (normalizedVolume * this.maxScale);
        const bubble = document.getElementById('bubble');
        bubble.style.opacity = '1'; // Ensure bubble is visible
        bubble.style.transform = `scale(${scale})`;
    }

    resetBubble() {
        const bubble = document.getElementById('bubble');
        bubble.style.transform = 'scale(1)';
        bubble.style.opacity = '1';
        bubble.style.filter = 'none';
        // Remove any remaining particles
        const oldParticles = bubble.querySelectorAll('.bubble-particle');
        oldParticles.forEach(p => p.remove());
    }

    popBubble() {
        console.log('Popping bubble!');
        const bubble = document.getElementById('bubble');
        const popSound = document.getElementById('pop-sound');
        popSound.currentTime = 0; // Reset the audio to start
        popSound.play();
        
        // Create burst particles
        const numParticles = 8;
        const particles = [];
        
        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'bubble-particle';
            const angle = (i / numParticles) * Math.PI * 2;
            const x = Math.cos(angle) * 50;
            const y = Math.sin(angle) * 50;
            
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.transform = 'translate(-50%, -50%)';
            
            bubble.appendChild(particle);
            particles.push({
                element: particle,
                angle: angle,
                speed: 2 + Math.random()
            });
        }

        // Quick slight expand
        bubble.style.transform = 'scale(1.1)';
        bubble.style.filter = 'brightness(1.2)';

        // Animate particles
        let frame = 0;
        const animate = () => {
            frame++;
            
            particles.forEach((particle, i) => {
                const x = Math.cos(particle.angle) * (frame * particle.speed * 2);
                const y = Math.sin(particle.angle) * (frame * particle.speed * 2);
                const scale = Math.max(0, 1 - frame/30);
                const opacity = Math.max(0, 1 - frame/20);
                
                particle.element.style.transform = 
                    `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
                particle.element.style.opacity = opacity;
            });

            if (frame === 1) {
                // Start bubble disappearance
                bubble.style.transform = 'scale(1.2)';
                bubble.style.opacity = '0.8';
            } else if (frame === 5) {
                bubble.style.transform = 'scale(0.8)';
                bubble.style.opacity = '0.4';
            } else if (frame === 10) {
                bubble.style.transform = 'scale(0)';
                bubble.style.opacity = '0';
            }

            if (frame < 30) {
                requestAnimationFrame(animate);
            } else {
                // Clean up particles
                particles.forEach(p => p.element.remove());
            }
        };

        requestAnimationFrame(animate);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.bubbleAnim = new BubbleAnimation();
});