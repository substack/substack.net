var music, talk;

var instrumentals = {
    lessig : {
        talk : [ 'http://www.youtube.com/watch?v=2YRCPTFjB3Q', 100, 11 ],
        music : [ 'http://www.youtube.com/watch?v=6Hh3tciRim0', 30, 0 ]
    },
    acai : {
        talk : [ 'http://www.youtube.com/watch?v=gRmd3OXs-qE', 100, 0 ],
        music : [ 'http://www.youtube.com/watch?v=DripIUEVjjA', 50, 0 ]
    },
    'manila slum' : {
        talk : [ 'http://www.youtube.com/watch?v=eYFzGkBqJ2c', 100, 5 ],
        music : [ 'http://www.youtube.com/watch?v=pt9Ov4gYtew', 40, 0 ]
    },
    'pop out' : {
        talk : [ 'http://www.youtube.com/watch?v=BnZks0BCCiw', 100, 0 ],
        music : [ 'http://www.youtube.com/watch?v=_83pa-KJGTc', 50, 0 ]
    },
    vancouver : {
        talk : [ 'http://www.youtube.com/watch?v=4VzOUKODdZ4', 30, 7 ],
        music : [ 'http://www.youtube.com/watch?v=ZnHmskwqCCQ', 100, 4 ]
    },
    'ryan dahl' : {
        talk : [ 'http://www.youtube.com/watch?v=L_JKb61EalQ', 50, 8 ],
        music : [ 'http://www.youtube.com/watch?v=sNChulAdILY', 50, 0 ]
    }
};

var queue = [];
var ready = {};

function onYouTubePlayerReady () {
    ready.player = true;
    for (var i = 0; i < queue.length; i++) queue[i]();
    queue = [];
}

function musicOnstateChange (state) {
    if (state === 0 && talk[0].getPlayerState() === 1) {
        music[0].seekTo(0);
    }
    else if (state === 5) {
        ready.music = true;
        if (ready.talk) {
            talk[0].playVideo();
            music[0].playVideo();
        }
    }
}

function talkOnstateChange (state) {
    if (state === 0) { // ended
        setInterval(function () {
            var v = music[0].getVolume();
            music[0].setVolume(Math.floor(v * 0.99));
        }, 10);
    }
    else if (state === 5) {
        ready.talk = true;
        if (ready.music) {
            talk[0].playVideo();
            music[0].playVideo();
        }
    }
}

$(document).ready(function () {
    for (var key in instrumentals) {
        var ins = instrumentals[key];
        var div = $('<div>').appendTo($('#playlist'));
        $('<a>')
            .attr('href', '?' + [
                'talkUri=' + escape(ins.talk[0]),
                'talkVolume=' + escape(ins.talk[1]),
                'talkOffset=' + escape(ins.talk[2]),
                'musicUri=' + escape(ins.music[0]),
                'musicVolume=' + escape(ins.music[1]),
                'musicOffset=' + escape(ins.music[2])
            ].join('&'))
            .text(key)
            .appendTo(div)
        ;
    }
    
    $('#play').click(function () {
        reload();
        
        $(this).val('pause').unbind('click').click(function pause () {
            talk[0].pauseVideo();
            music[0].pauseVideo();
            
            $(this).val('play').unbind('click').click(function () {
                talk[0].playVideo();
                music[0].playVideo();
                $(this).val('pause').unbind('click').click(pause);
            });
        });
    });
    
    var query = (window.location.search || '').replace(/^\?/, '');
    var params = query.split('&').reduce(function (acc, s) {
        var xs = s.split('=');
        var key = unescape(xs[0]);
        var value = unescape(xs[1] || '');
        
        if (value.match(/^\d+$/)) value = parseInt(value, 10);
        acc[key] = value;
        return acc;
    }, {});
    
    if (params.talkUri) $('#talk-uri').val(params.talkUri);
    if (params.talkVolume) $('#talk-volume').val(params.talkVolume);
    if (params.talkOffset) $('#talk-offset').val(params.talkOffset);
    
    if (params.musicUri) $('#music-uri').val(params.musicUri);
    if (params.musicVolume) $('#music-volume').val(params.musicVolume);
    if (params.musicOffset) $('#music-offset').val(params.musicOffset);
    
    if (query.length) $('#play').trigger('click');
    
    $('#reload').click(reload);
    
    function reload () {
        if (!ready.player) return queue.push(reload);
        ready = { player : true };
        
        $('#link').attr('href', '?' + [
            'talkUri=' + escape($('#talk-uri').val()),
            'talkVolume=' + escape($('#talk-volume').val()),
            'talkOffset=' + escape($('#talk-offset').val()),
            'musicUri=' + escape($('#music-uri').val()),
            'musicVolume=' + escape($('#music-volume').val()),
            'musicOffset=' + escape($('#music-offset').val())
        ].join('&'));
        
        talk = $('#talk-api');
        var talkUri = $('#talk-uri').val();
        var talkId = talkUri.match(/\bv=([^&]+)/)[1];
        
        talk[0].setVolume(parseInt($('#talk-volume').val(), 10));
        talk[0].addEventListener('onStateChange', 'talkOnstateChange');
        talk[0].cueVideoById(talkId, parseInt($('#talk-offset').val(), 10));
        
        music = $('#music-api');
        var musicUri = $('#music-uri').val();
        var musicId = musicUri.match(/\bv=([^&]+)/)[1];
        
        music[0].setVolume(parseInt($('#music-volume').val(), 10));
        music[0].addEventListener('onStateChange', 'musicOnstateChange');
        music[0].cueVideoById(musicId, parseInt($('#music-offset').val(), 10));
    }
});
