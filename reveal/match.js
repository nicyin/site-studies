$(document).ready(function() {
    const $passage = $('.passage');
    let isSelecting = false;
    let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    function processNode(node) {
        if (node.nodeType === 3) {
            const words = node.textContent.match(/\b\w+\b|\W+/g) || [];
            words.forEach(word => {
                const span = document.createElement('span');
                span.textContent = word;
                if (/\b\w+\b/.test(word)) {
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

    $passage.find('p').each(function() {
        processNode(this);
    });

    $(document).on('mousedown touchstart', '.passage', function(e) {
        if (e.type === 'touchstart') {
            e.preventDefault();
        }
        isSelecting = true;
    });

    // Show a faint preview of what will be revealed while dragging
    document.addEventListener('selectionchange', function() {
        if (!isSelecting) return;

        const selection = window.getSelection();
        const text = selection.toString().trim();

        $('.word').removeClass('preview');

        if (text && text.length > 0) {
            const selectedWords = text.toLowerCase().match(/\b\w+\b/g) || [];
            selectedWords.forEach(word => {
                $(`.word[data-word="${word}"]`).not('.revealed').addClass('preview');
            });
        }
    });

    // On release: permanently reveal all instances of each selected word
    $(document).on('mouseup touchend', function() {
        if (!isSelecting) return;
        isSelecting = false;

        $('.word').removeClass('preview');

        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text && text.length > 0) {
            const selectedWords = text.toLowerCase().match(/\b\w+\b/g) || [];
            selectedWords.forEach(word => {
                $(`.word[data-word="${word}"]`).addClass('revealed');
            });
        }

        selection.removeAllRanges();
    });

    if (isMobile) {
        $(document).on('touchmove', '.passage', function(e) {
            if (isSelecting) {
                e.preventDefault();
            }
        });
    }
});