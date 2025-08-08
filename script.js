$(document).ready(function() {

    $('.prompt').hover(
        function() {
            // On mouse enter - start animation
            $(this).prev('.star').css('animation', 'rotateAnimation 3s linear infinite');
            $(this).prev('.star').css('color', '#0000ff');
        },
        function() {
            // On mouse leave - stop animation
            $(this).prev('.star').css('animation', 'none');
            $(this).prev('.star').css('color', '#000000');
        }
    );
});