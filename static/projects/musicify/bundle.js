;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var baudio = require('webaudio');

var textarea = document.querySelector('textarea');
var errdiv = document.querySelector('#error');

var fn = function () { return 0 };
var b = baudio(function (t, i) {
    return fn(t, i);
});

var button = document.querySelector('#play-stop');
button.addEventListener('click', function (ev) {
    var action = button.value;
    button.value = { play: 'stop', stop: 'play' }[button.value];
    
    update();
    
    if (action === 'play') {
        b.play();
    }
    else {
        b.stop();
    }
});

function update () {
    try {
        fn = Function(textarea.value)();
    }
    catch (err) {
        errdiv.appendChild(document.createTextNode(String(err)));
        return;
    }
    errdiv.innerHTML = '';
}

},{"webaudio":2}],2:[function(require,module,exports){
module.exports = function (context, fn) {
	
    if (typeof context === 'function') {
      fn = context;
      context = new webkitAudioContext() ;
    }

    var self = context.createScriptProcessor(2048, 1, 1);

	  self.fn = fn
	
	  self.i = self.t = 0
	
  	window._SAMPLERATE = self.sampleRate = self.rate = context.sampleRate;

		self.duration = Infinity;
		
		self.recording = false;

	  self.onaudioprocess = function(e){
	    var output = e.outputBuffer.getChannelData(0)
			,   input = e.inputBuffer.getChannelData(0);
			self.tick(output, input);
	  };
	
		self.tick = function (output, input) { // a fill-a-buffer function

		    output = output || self._buffer;
		
		    input = input || []

		    for (var i = 0; i < output.length; i += 1) {

		        self.t = self.i / self.rate;
		
		        self.i += 1;

						output[i] = self.fn(self.t, self.i, input[i]);
						
		        if(self.i >= self.duration) {
			    		self.stop()
			    		break;
		        }

		    }

		    return output
		};
		
		self.stop = function(){
			self.disconnect();
			
		  self.playing = false;
		
		  if(self.recording) {
  		}
		};

		self.play = function(opts){

		  if (self.playing) return;

		  self.connect(self.context.destination);
		
		  self.playing = true;

		// this timeout seems to be the thing that keeps the audio from clipping #WTFALEART

		  setTimeout(function(){this.node.disconnect()}, 100000000000)

		  return
		};

		self.record = function(){

		};
		
		self.reset = function(){
			self.i = self.t = 0
		};
		
		self.createSample = function(duration){
			self.reset();
	    var buffer = self.context.createBuffer(1, duration, self.context.sampleRate)
			var blob = buffer.getChannelData(0);
	    self.tick(blob);
			return buffer
		};

    return self;
};

function mergeArgs (opts, args) {
    Object.keys(opts || {}).forEach(function (key) {
        args[key] = opts[key];
    });
    
    return Object.keys(args).reduce(function (acc, key) {
        var dash = key.length === 1 ? '-' : '--';
        return acc.concat(dash + key, args[key]);
    }, []);
}

function signed (n) {
    if (isNaN(n)) return 0;
    var b = Math.pow(2, 15);
    return n > 0
        ? Math.min(b - 1, Math.floor((b * n) - 1))
        : Math.max(-b, Math.ceil((b * n) - 1))
    ;
}

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvaG9tZS9zdWJzdGFjay9wcm9qZWN0cy9tdXNpY2lmeS9tYWluLmpzIiwiL2hvbWUvc3Vic3RhY2svcHJvamVjdHMvbXVzaWNpZnkvbm9kZV9tb2R1bGVzL3dlYmF1ZGlvL3dlYmF1ZGlvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGJhdWRpbyA9IHJlcXVpcmUoJ3dlYmF1ZGlvJyk7XG5cbnZhciB0ZXh0YXJlYSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3RleHRhcmVhJyk7XG52YXIgZXJyZGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Vycm9yJyk7XG5cbnZhciBmbiA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDAgfTtcbnZhciBiID0gYmF1ZGlvKGZ1bmN0aW9uICh0LCBpKSB7XG4gICAgcmV0dXJuIGZuKHQsIGkpO1xufSk7XG5cbnZhciBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGxheS1zdG9wJyk7XG5idXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXYpIHtcbiAgICB2YXIgYWN0aW9uID0gYnV0dG9uLnZhbHVlO1xuICAgIGJ1dHRvbi52YWx1ZSA9IHsgcGxheTogJ3N0b3AnLCBzdG9wOiAncGxheScgfVtidXR0b24udmFsdWVdO1xuICAgIFxuICAgIHVwZGF0ZSgpO1xuICAgIFxuICAgIGlmIChhY3Rpb24gPT09ICdwbGF5Jykge1xuICAgICAgICBiLnBsYXkoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGIuc3RvcCgpO1xuICAgIH1cbn0pO1xuXG5mdW5jdGlvbiB1cGRhdGUgKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGZuID0gRnVuY3Rpb24odGV4dGFyZWEudmFsdWUpKCk7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgZXJyZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFN0cmluZyhlcnIpKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZXJyZGl2LmlubmVySFRNTCA9ICcnO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29udGV4dCwgZm4pIHtcblx0XG4gICAgaWYgKHR5cGVvZiBjb250ZXh0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmbiA9IGNvbnRleHQ7XG4gICAgICBjb250ZXh0ID0gbmV3IHdlYmtpdEF1ZGlvQ29udGV4dCgpIDtcbiAgICB9XG5cbiAgICB2YXIgc2VsZiA9IGNvbnRleHQuY3JlYXRlU2NyaXB0UHJvY2Vzc29yKDIwNDgsIDEsIDEpO1xuXG5cdCAgc2VsZi5mbiA9IGZuXG5cdFxuXHQgIHNlbGYuaSA9IHNlbGYudCA9IDBcblx0XG4gIFx0d2luZG93Ll9TQU1QTEVSQVRFID0gc2VsZi5zYW1wbGVSYXRlID0gc2VsZi5yYXRlID0gY29udGV4dC5zYW1wbGVSYXRlO1xuXG5cdFx0c2VsZi5kdXJhdGlvbiA9IEluZmluaXR5O1xuXHRcdFxuXHRcdHNlbGYucmVjb3JkaW5nID0gZmFsc2U7XG5cblx0ICBzZWxmLm9uYXVkaW9wcm9jZXNzID0gZnVuY3Rpb24oZSl7XG5cdCAgICB2YXIgb3V0cHV0ID0gZS5vdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMClcblx0XHRcdCwgICBpbnB1dCA9IGUuaW5wdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7XG5cdFx0XHRzZWxmLnRpY2sob3V0cHV0LCBpbnB1dCk7XG5cdCAgfTtcblx0XG5cdFx0c2VsZi50aWNrID0gZnVuY3Rpb24gKG91dHB1dCwgaW5wdXQpIHsgLy8gYSBmaWxsLWEtYnVmZmVyIGZ1bmN0aW9uXG5cblx0XHQgICAgb3V0cHV0ID0gb3V0cHV0IHx8IHNlbGYuX2J1ZmZlcjtcblx0XHRcblx0XHQgICAgaW5wdXQgPSBpbnB1dCB8fCBbXVxuXG5cdFx0ICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3V0cHV0Lmxlbmd0aDsgaSArPSAxKSB7XG5cblx0XHQgICAgICAgIHNlbGYudCA9IHNlbGYuaSAvIHNlbGYucmF0ZTtcblx0XHRcblx0XHQgICAgICAgIHNlbGYuaSArPSAxO1xuXG5cdFx0XHRcdFx0XHRvdXRwdXRbaV0gPSBzZWxmLmZuKHNlbGYudCwgc2VsZi5pLCBpbnB1dFtpXSk7XG5cdFx0XHRcdFx0XHRcblx0XHQgICAgICAgIGlmKHNlbGYuaSA+PSBzZWxmLmR1cmF0aW9uKSB7XG5cdFx0XHQgICAgXHRcdHNlbGYuc3RvcCgpXG5cdFx0XHQgICAgXHRcdGJyZWFrO1xuXHRcdCAgICAgICAgfVxuXG5cdFx0ICAgIH1cblxuXHRcdCAgICByZXR1cm4gb3V0cHV0XG5cdFx0fTtcblx0XHRcblx0XHRzZWxmLnN0b3AgPSBmdW5jdGlvbigpe1xuXHRcdFx0c2VsZi5kaXNjb25uZWN0KCk7XG5cdFx0XHRcblx0XHQgIHNlbGYucGxheWluZyA9IGZhbHNlO1xuXHRcdFxuXHRcdCAgaWYoc2VsZi5yZWNvcmRpbmcpIHtcbiAgXHRcdH1cblx0XHR9O1xuXG5cdFx0c2VsZi5wbGF5ID0gZnVuY3Rpb24ob3B0cyl7XG5cblx0XHQgIGlmIChzZWxmLnBsYXlpbmcpIHJldHVybjtcblxuXHRcdCAgc2VsZi5jb25uZWN0KHNlbGYuY29udGV4dC5kZXN0aW5hdGlvbik7XG5cdFx0XG5cdFx0ICBzZWxmLnBsYXlpbmcgPSB0cnVlO1xuXG5cdFx0Ly8gdGhpcyB0aW1lb3V0IHNlZW1zIHRvIGJlIHRoZSB0aGluZyB0aGF0IGtlZXBzIHRoZSBhdWRpbyBmcm9tIGNsaXBwaW5nICNXVEZBTEVBUlRcblxuXHRcdCAgc2V0VGltZW91dChmdW5jdGlvbigpe3RoaXMubm9kZS5kaXNjb25uZWN0KCl9LCAxMDAwMDAwMDAwMDApXG5cblx0XHQgIHJldHVyblxuXHRcdH07XG5cblx0XHRzZWxmLnJlY29yZCA9IGZ1bmN0aW9uKCl7XG5cblx0XHR9O1xuXHRcdFxuXHRcdHNlbGYucmVzZXQgPSBmdW5jdGlvbigpe1xuXHRcdFx0c2VsZi5pID0gc2VsZi50ID0gMFxuXHRcdH07XG5cdFx0XG5cdFx0c2VsZi5jcmVhdGVTYW1wbGUgPSBmdW5jdGlvbihkdXJhdGlvbil7XG5cdFx0XHRzZWxmLnJlc2V0KCk7XG5cdCAgICB2YXIgYnVmZmVyID0gc2VsZi5jb250ZXh0LmNyZWF0ZUJ1ZmZlcigxLCBkdXJhdGlvbiwgc2VsZi5jb250ZXh0LnNhbXBsZVJhdGUpXG5cdFx0XHR2YXIgYmxvYiA9IGJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKTtcblx0ICAgIHNlbGYudGljayhibG9iKTtcblx0XHRcdHJldHVybiBidWZmZXJcblx0XHR9O1xuXG4gICAgcmV0dXJuIHNlbGY7XG59O1xuXG5mdW5jdGlvbiBtZXJnZUFyZ3MgKG9wdHMsIGFyZ3MpIHtcbiAgICBPYmplY3Qua2V5cyhvcHRzIHx8IHt9KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgYXJnc1trZXldID0gb3B0c1trZXldO1xuICAgIH0pO1xuICAgIFxuICAgIHJldHVybiBPYmplY3Qua2V5cyhhcmdzKS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywga2V5KSB7XG4gICAgICAgIHZhciBkYXNoID0ga2V5Lmxlbmd0aCA9PT0gMSA/ICctJyA6ICctLSc7XG4gICAgICAgIHJldHVybiBhY2MuY29uY2F0KGRhc2ggKyBrZXksIGFyZ3Nba2V5XSk7XG4gICAgfSwgW10pO1xufVxuXG5mdW5jdGlvbiBzaWduZWQgKG4pIHtcbiAgICBpZiAoaXNOYU4obikpIHJldHVybiAwO1xuICAgIHZhciBiID0gTWF0aC5wb3coMiwgMTUpO1xuICAgIHJldHVybiBuID4gMFxuICAgICAgICA/IE1hdGgubWluKGIgLSAxLCBNYXRoLmZsb29yKChiICogbikgLSAxKSlcbiAgICAgICAgOiBNYXRoLm1heCgtYiwgTWF0aC5jZWlsKChiICogbikgLSAxKSlcbiAgICA7XG59XG4iXX0=
;