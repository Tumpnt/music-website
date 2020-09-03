"use strict";
var context;

var songpitch = 440;
var playingnotes = [];

genEvent.add("init", function () {
	context = new AudioContext();
});
function updatenotes(start, stop) {
	for (let note of stop) {
		let ntd;
		for (let ii in playingnotes) {
			let s = playingnotes[ii];
			if (s.note == note) {
				ntd = s.sound;
				playingnotes.splice(ii, 1);
				break;
			}
		}
		if (ntd)
			ntd.stop();
		genEvent.send('noteStop', note);
		let k = document.getElementsByClassName('key')[note];
		if (k)
			k.style.backgroundColor = '';
	}
	for (let note of start) {
		genEvent.send('noteStart', note);

		let k = document.getElementsByClassName('key')[note];
		if (k)
			k.style.backgroundColor = 'red';

		//playingnotes.unshift({ sound: 1, note })
	}
}