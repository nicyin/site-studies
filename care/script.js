$(document).ready(function() {
    
    const bodyTags = '&lt;body&gt;&lt;/body&gt;';
    const emptyH1 = '&lt;body&gt;<br>&lt;h1&gt;&lt;/h1&gt;<br>&lt;/body&gt;';
    const fullH1 = '&lt;h1&gt;Welcome to my site!&lt;/h1&gt;';

    let step = 0;

    $('.tool').click(function() {
        step++;

        switch(step) {
            case 1:
                $('#code').html(bodyTags);
                break;

            case 2:
                $('#code').html(emptyH1).fadeIn(400);
                break;

            case 3:
                $('#code').html(fullH1);
                break;

            case 4:
                $('#code').fadeOut(400, function(){
                    $(this).empty();
                    $('<h1>')
                        .text('Welcome to my site!')
                        .hide()
                        .appendTo('#real-page')
                        .fadeIn(400);
                });
                break;
        }
    })


});