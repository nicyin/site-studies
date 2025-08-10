$(document).ready(function() {
    const $passage = $('.passage');
    let isSelecting = false;
    let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Split into words and preserve spaces/punctuation
    function processNode(node) {
        if (node.nodeType === 3) { // Text node
            const words = node.textContent.match(/\b\w+\b|\W+/g) || [];
            words.forEach(word => {
                const span = document.createElement('span');
                span.textContent = word;
                if (/\b\w+\b/.test(word)) { // If it's a word (not punctuation/space)
                    span.className = 'word';
                    span.dataset.word = word.toLowerCase();
                }
                node.parentNode.insertBefore(span, node);
            });
            node.parentNode.removeChild(node);
        } else {
            Array.from(node.childNodes).forEach(processNode);
        }
    }

    // Process all text in paragraphs
    $passage.find('p').each(function() {
        processNode(this);
    });

    // Handle selection start
    $(document).on('mousedown touchstart', '.passage', function(e) {
        if (e.type === 'touchstart') {
            e.preventDefault(); // Prevent zoom on double-tap
        }
        isSelecting = true;
        $passage.addClass('selecting');
    });

    // Handle selection changes
    document.addEventListener('selectionchange', function() {
        if (!isSelecting) return;
        
        const selection = window.getSelection();
        const text = selection.toString().trim();
        
        if (text && text.length > 0) {
            // Split selection into words
            const selectedWords = text.toLowerCase().match(/\b\w+\b/g) || [];
            
            // Remove previous highlights
            $('.word').removeClass('match-highlight');
            
            // Check each word for matches
            selectedWords.forEach(word => {
                const matches = $(`.word[data-word="${word}"]`);
                if (matches.length > 1) {
                    matches.addClass('match-highlight');
                }
            });
        }
    });

    // Handle selection end
    $(document).on('mouseup touchend', function(e) {
        if (!isSelecting) return;
        isSelecting = false;
        $passage.removeClass('selecting');
        
        const selection = window.getSelection();
        const text = selection.toString().trim();
        
        if (text && text.length > 0) {
            const selectedWords = text.toLowerCase().match(/\b\w+\b/g) || [];
            let hasAnyMatches = false;
            
            selectedWords.forEach(word => {
                const matches = $(`.word[data-word="${word}"]`);
                if (matches.length > 1) {
                    hasAnyMatches = true;
                }
            });
            
            if (!hasAnyMatches && !isMobile) {
                // Only clear selection on desktop - keep it on mobile for better UX
                selection.removeAllRanges();
            }
        }
    });

    // Handle touch move to prevent page scrolling while selecting
    if (isMobile) {
        $(document).on('touchmove', '.passage', function(e) {
            if (isSelecting) {
                e.preventDefault();
            }
        });
    }
});