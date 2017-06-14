// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

window.onload = function() {
    var tables = document.querySelectorAll('table');
    for(var i = 0 ; i < tables.length ; i++) {
        if(!tables[i].classList.contains('pure-table')) {
            tables[i].classList.add('pure-table');
        }
    }

    var press = document.querySelector('.press-content');
    if(press !== null) {
        var imgs = press.querySelectorAll('img');
        for(var i = 0 ; i < imgs.length ; i++) {
            imgs[i].classList.add('pure-img');
        }
    }


    $('.popup-gallery').magnificPopup({
		delegate: 'a',
		type: 'image',
		tLoading: 'Loading image #%curr%...',
		mainClass: 'mfp-img-mobile',
		gallery: {
			enabled: true,
			navigateByImgClick: true,
			preload: [0,1] // Will preload 0 - before current, and 1 after the current image
		},
		image: {
			tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
		}
	});

    // http://stackoverflow.com/questions/15164942/stop-embedded-youtube-iframe
    var trailer = $('.trailer-video');
    trailer.click(function() {
        trailer.hide(500, function() {
            $('.youtube-player-iframe').each(function(){
                this.contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*')
            });
        });
    })

    $('.play-trailer').click(function() {
        trailer.show(500, function() {
            $('.youtube-player-iframe').each(function(){
                this.contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*')
            });
        });
    });
};
