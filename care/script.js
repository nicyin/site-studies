$(function() {
    // Make tools draggable
    $('.tool').draggable({
        helper: 'clone',
        revert: false,
        opacity: 0.7,
        cursor: 'grabbing'
    });

    // Define drop handler function once
    function handleDrop(event, ui) {
        const tool = ui.draggable.attr('id');
        const target = $(this).attr('id');
        console.log(`${tool} was dropped on ${target}`);

        const currentState = $(this).data('state') || 'icon';

        switch(tool) {
            case 'water':
                const clone = $(this).clone();

                clone.droppable({
                    accept: '.tool',
                    hoverClass: 'drop-hover',
                    drop: handleDrop
                });

                clone.appendTo('#grow-area');
                break;

            case 'sun':
                switch(currentState) {
                    case 'icon':
                        $(this).find('img').remove();
                        $(this).addClass('grown');
                        if(target === 'cloud') {
                            $(this).html('heading');

                        } else if(target === 'leaf') {
                            $(this).html('content');
                        }
                        $(this).data('state', 'grown');
                        //$(this).appendTo('#structure');
                        break;
                    
                    case 'grown':
                        if (!$(this).hasClass('populated')) {
                            if(target === 'cloud'){
                                // EDIT ARRAY HERE
                                const headings = [
                                    'About Me',
                                    "What I'm Listening To Right Now", 
                                    'Links', 
                                    'Welcome to my Page',
                                    '. ☆ . • ☆ . ° .• °:. *₊ ° . ☆',
                                    '˚ ༘♡ ·˚꒰ᥕᥱᥣᥴ᥆꧑ᥱ t᥆ ꧑ᥡ bᥣ᥆g꒱ ₊˚ˑ༄'
                                ];
                                const randomHeading = headings[Math.floor(Math.random() * headings.length)];
                                $(this).html(randomHeading);
                            } else if(target === 'leaf') {
                                const contents = [
                                    // EDIT ARRAY HERE
                                    'Hello and welcome to my site!',
                                    '<img src="care/images/picmix1.gif">',
                                    "This is where I'll post cool stuff I find online, pix of my friends, and random thoughts",
                                    '<img src="care/images/picmix2.gif">',
                                    '<img src="care/images/picmix3.gif">',
                                    '<img src="care/images/picmix4.gif">',
                                    '<img src="care/images/picmix5.gif">',
                                    '<a href="http://neopets.com">Neopets</a> | <a href="http://xanga.com">Xanga</a> | <a href="http://livejournal.com">Livejournal</a>',
                                    '<iframe width="560" height="315" src="https://www.youtube.com/embed/t0bPrt69rag?si=iRNNj_q6lVG7yqoR" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>'
                                ];
                                const randomContent = contents[Math.floor(Math.random() * contents.length)];
                                $(this).html(randomContent);
                            }
                            $(this).addClass('populated');
                            $(this).css('color', '#000000');
                            $(this).data('state', 'populated');
                        } else {
                            console.log('This element already has content');
                        }
                        break;

                    case 'populated':
                        console.log('This element is already grown');
                        break;
                }
                break;

            case 'heart':
                switch(currentState){
                    /*case 'icon':
                    break;*/

                    case 'grown':
                        if(target === 'cloud') {
                            $(this).addClass('populated-header-styled');

                        } else if(target === 'leaf') {
                            $(this).addClass('populated-content-styled');
                        }
                        break;

                    case 'populated':
                        //if(!$(this).hasClass('populated-header-styled') || !$(this).hasClass('populated-content-styled')){
                            if(target === 'cloud') {
                                $(this).addClass('populated-header-styled');
    
                            } else if(target === 'leaf') {
                                $(this).addClass('populated-content-styled');
                            }
                        //}
                        break;

                }

            break;

        }
    }

    // Add click handler for cloud and leaf tools
    $('.tool').click(function() {
        const toolId = $(this).attr('id');
            
            // Only handle cloud and leaf clicks
        if (toolId === 'cloud' || toolId === 'leaf') {
            const newElement = $('<div>', {
                class: 'grow',
                id: toolId
            }).append(
                $('<img>', {
                        src: `care/tools/${toolId}.png`,
                    alt: toolId === 'cloud' ? 'shade' : 'plant'
                })
            );
                
            // Add the new element and make it droppable
            newElement.appendTo('#grow-area').droppable({
                accept: '.tool',
                hoverClass: 'drop-hover',
                drop: handleDrop
            });
        }
    });

    // Make grow elements droppable
    $('.grow').droppable({
        accept: '.tool',
        hoverClass: 'drop-hover',
        drop: handleDrop
    });
});