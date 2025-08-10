$(document).ready(function() {
    const $passage = $('.passage');
    let isSelecting = false;
    
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

    // When starting selection
    $(document).on('mousedown', '.passage', function() {
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

    // When ending selection
    $(document).on('mouseup', function() {
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
            
            if (!hasAnyMatches) {
                // If no matches found for any word, clear the selection
                selection.removeAllRanges();
            }
        }
    });
});