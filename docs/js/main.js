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

function getLanguage() {
    // chrome
    // ko-KR
    if(navigator.language) {
        return navigator.language;
    }

    // ie
    // ko-KR
    if(navigator.userLanguage) {
        return navigator.userLanguage;
    }
    if(navigator.browserLanguage) {
        return navigator.browserLanguage;
    }
    if(navigator.systemLanguage) {
        return navigator.systemLanguage;
    }
    // default value
    return 'en';
}

// 대문인 경우에만 언어 분기
if(location.pathname == "/" || location.pathname == "index.html") {
    var lang = getLanguage();
    if(lang.startsWith('ko')) {
        location.href='/ko';
    }
}

// Place any jQuery/helper plugins in here.

var chroma = null;

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

    if(canPlayCubeVideo()) {
        chroma = playCubeVideo();
    }
};

function canPlayCubeVideo() {
    // https://stackoverflow.com/a/14317857
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if(isMobile) {
        return false;
    }
    var gamePlayVideoElem = document.getElementById('game-play-video-orig');
    if(!gamePlayVideoElem) {
        return false;
    }

    // 동영상 비활성화
    // 크로마키 기반 동영상을 집어넣는데는 몇가지 문제가 있어서 비활성화 시켰다
    // 1. webgl 기반이도 부동소수점 처리가 GPU에 따라서 약간씩 다른거같다
    // 예를 들어 데탑에서는 멀쩡한 이미지가 갤7 스냅드래곤에서는 이상하게 보일수있다
    // 2. 동영상 퀄리티가 높아야한다
    // 스크린샷은 별별 옵션을 다 켜놓고 찍은거같은데
    // movie 브렌치의 현재 속성으로는 그정도의 퀄리티가 안나온다
    // 3. 데탑에서는 별 문제없지만 모바일에서는 최초 로딩이 많이 느리다.
    // 모바일 분기는 이거때문에 준비

    // 동영상 찍기전에 작업할 내용
    // https://github.com/brianchirls/Seriously.js/wiki/Chroma-Key
    // 1. 배경색=66, 195, 31
    // 크로마키는 기본값 쓰는게 제일 무난하더라
    // 2. 프레임의 알파를 높힌다. 그렇지 않으면 프레임도 크로마키로 짤려버린다
    // 3. 대표 이미지의 스테이지는 earth_7을 고쳐서 유도 가능하다.
    // 실제로는 몇번 스테이지인지 모르겠다.
    // 4. unity virtual reality supported 옵션 끄기.
    // vr때문에 ortho 카메라 설정이 무시된다.

    return false;
    //return true;
}


function playCubeVideo() {
    var gamePlayVideoElem = document.getElementById('game-play-video-orig');
    if(!gamePlayVideoElem) {
        return null;
    }
    // 초기 상태 : 이미지는 보이지만 동영상 관련은 숨김
    // 동영상 재생을 시도하면 콜백이 불릴것이다
    // 만약 콜백이 제대로 호출되면 이미지를 숨기고 동영상을 보여주기
    // 초기 상태는 css로 통제

    // 동영상 활성화용
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
    //chroma.screen = [1, 1, 1, 1];
    //chroma.balance = 1;
    //chroma.weight = 0;
    //chroma.clipBlack = 0;
    //chroma.clipWhite = 1;

    target.source = chroma;
    seriously.go();

    // 동영상 강제 재생
    // 모바일에서는 display none이면 자동재생을 안하길래 수동으로
    gamePlayVideoElem.play();
    return chroma;
}
