// this is an entry file for use with *browserify* v.2 http://github.com/substack/browserify
// browserify is the breeder's choice for front-end web development the Node.js way
// this repo can also be used with OPA, a web dev heloper tool http://github.com/NHQ/opa

var webaudio = require('../webaudio')
  , osc = require('oscillators')()
  , audio = new webkitAudioContext()
  , play = document.getElementById('play')
  , stop = document.getElementById('stop')
  , tau = Math.PI * 2
  , f = 555
;

function sine(time, i, sample){
  return osc.sine(time, 333) + osc.saw(time / 2 % .2, 333 * 3 / 2 * osc.square(time,1.3))
}

function gain(time, i, sample){
  return sample * .25		
};

var channel1 = webaudio(audio, sine);

var channel2 = webaudio(audio, gain);

play.addEventListener('click', function(){
	channel1.connect(channel2)
	channel2.play() // .connect(audio.destination);
});

stop.addEventListener('click', function(){
	channel1.stop()
});
