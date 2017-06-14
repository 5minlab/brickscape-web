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

    // 대문의 경우
    var gamePlayVideoElem = document.getElementById('game-play-video-orig');
    if(gamePlayVideoElem !== null) {
        // 초기 상태 : 이미지는 보이지만 동영상 관련은 숨김
        // 동영상 재생을 시도하면 콜백이 불릴것이다
        // 만약 콜백이 제대로 호출되면 이미지를 숨기고 동영상을 보여주기
        // 초기 상태는 css로 통제

        // video 이벤트
        gamePlayVideoElem.onplay = function() {
            var func = function() {
                $('.cube-image').hide();
                $('.cube-video').show();
            }

            var fired = false;
            return function() {
                if(!fired) {
                    func();
                }
                fired = true;
            }
        }();

        var seriously = new Seriously();
        var source = seriously.source('#game-play-video-orig');
        var target = seriously.target('#game-play-video-transparent');
        var chroma = seriously.effect('chroma');

        // connect all our nodes in the right order
        chroma.source = source;
        target.source = chroma;
        seriously.go();

        // 동영상 강제 재생
        // 모바일에서는 display none이면 자동재생을 안하길래 수동으로
        gamePlayVideoElem.play();
    }
};
