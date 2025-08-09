let webcamStream;
let isProcessing = false;
let lastImageData;
let stillnessDuration = 0;
const STILLNESS_THRESHOLD = 5;
const MAX_BLUR = 20;

// Initialize webcam
async function init() {
    try {
        console.log('Initializing...');
        
        // Get webcam access
        webcamStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });

        const $video = $('#webcam');
        const $status = $('#status');
        
        $video[0].srcObject = webcamStream;
        $video.hide(); // Hide the video element

        // Wait for video to be ready
        await new Promise(resolve => $video[0].onloadedmetadata = resolve);
        
        $('#status').hide();
        $('#instructions').show();
        $('#instructions').css('display', 'block');

        // Start detection
        startDetection();

    } catch (error) {
        console.log('Error during initialization:', error);
        const $status = $('#status');
        if (error.name === 'NotAllowedError') {
            $status.text('Camera permission denied. Please allow camera access to use this website.');
        } else {
            $status.text('Error initializing: ' + error.message);
        }
        console.error('Initialization error:', error);
    }
}

function detectMovement(currentImageData) {
    if (!lastImageData) {
        lastImageData = currentImageData;
        return false;
    }

    const length = currentImageData.data.length;
    let diff = 0;

    // Compare pixels between current and last frame
    for (let i = 0; i < length; i += 4) {
        diff += Math.abs(currentImageData.data[i] - lastImageData.data[i]);
    }

    // Calculate average difference
    const avgDiff = diff / (length / 4);
    lastImageData = currentImageData;

    return avgDiff > STILLNESS_THRESHOLD;
}

function startDetection() {
    if (isProcessing) return;
    isProcessing = true;

    const $video = $('#webcam');
    const $canvas = $('#processing-canvas');
    const ctx = $canvas[0].getContext('2d');
    const $status = $('#status');
    const $content = $('#blur-content');
    
    // Set canvas size to match video
    $canvas[0].width = $video[0].videoWidth;
    $canvas[0].height = $video[0].videoHeight;

    function processFrame() {
        if (!isProcessing) return;

        // Draw current frame to canvas
        ctx.drawImage($video[0], 0, 0);
        const currentImageData = ctx.getImageData(0, 0, $canvas[0].width, $canvas[0].height);

        // Check for movement
        const hasMovement = detectMovement(currentImageData);

        if (hasMovement) {
            stillnessDuration = 0;
            $content.css({
                'transition': 'filter 0.1s ease',
                'filter': 'blur(0px)'
            });
            $('#instructions').text(`hold still & stare`);
            // Set a flag to prevent immediate text change
            window.lastMovement = Date.now();
        } else {
            stillnessDuration++;
            const blur = Math.min(MAX_BLUR, (stillnessDuration / 160));
            $content.css('filter', `blur(${blur}px)`);

            if (!window.lastMovement || Date.now() - window.lastMovement > 500) {
                $('#instructions').text('👁👁');
                
                // Check if maximum blur reached
                if (blur >= MAX_BLUR) {
                    $('#instructions').text('the end');
                    // You could add more effects here, like:
                    // $content.fadeOut(3000); // Slowly fade out the image
                    // or
                    // $('#instructions').css('font-size', '3em'); // Make text bigger
                }
            }
        }

        requestAnimationFrame(processFrame);
    }

    processFrame();
}

// Start everything when the page loads
$(document).ready(() => {
    console.log('DOM loaded, starting initialization...');
    init();
});