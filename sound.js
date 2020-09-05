"use strict";
var audioCtx;

var songPitch = 440;

events.on("init", function () {
	audioCtx = new AudioContext();
});
function updatenotes(start, stop) {
	for (let note of stop) {
		events.emit('noteStop', note);

		let k = document.querySelector(`.key[data-note="${note}"]`);
		if (k)
			k.style.backgroundColor = '';
	}
	for (let note of start) {
		events.emit('noteStart', note);

		let k = document.querySelector(`.key[data-note="${note}"]`);
		if (k)
			k.style.backgroundColor = 'red';
	}
}