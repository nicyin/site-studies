$(document).ready(function() {

    $('.prompt').hover(
        function() {
            const $star = $(this).prev('.star');
            $star.css('animation', 'rotateAnimation 3s linear infinite');
            if ($(this).find('a').length > 0) {
                $star.css('color', '#0000ff');
            }
        },
        function() {
            const $star = $(this).prev('.star');
            $star.css('animation', 'none');
            $star.css('color', '#000000');
        }
    );
});