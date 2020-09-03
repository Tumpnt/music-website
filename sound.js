var context;
"use strict";

var songpitch = 440;
var playingnotes = [];

genEvent.add("init", function () {
	context = new AudioContext();
});
class updateNote {
	play(n) {
		var ntd;
		var n = stop[i];
		for (let ii in playingnotes) {
			var s = playingnotes[ii];
			if (s.note == n) {
				ntd = s.sound;
				playingnotes.splice(ii, 1);

				break;
			}
		}
		if (ntd) {
			ntd.stop();
			document.getElementsByClassName('key')[n].style = '';
		}
		var n = stop[i];
		genEvent.send('noteStop', n);
		document.getElementsByClassName('key')[n].style = '';
	}
	stop(n) {
		genEvent.send('noteStart', n);

		document.getElementsByClassName('key')[n].style.backgroundColor = 'red';

		//playingnotes.unshift({ sound: 1, note: n })
	}
}
function updatenotes(start, stop) {
	for (let i in stop) {
		var ntd;
		var n = stop[i];
		for (let ii in playingnotes) {
			var s = playingnotes[ii];
			if (s.note == n) {
				ntd = s.sound;
				playingnotes.splice(ii, 1);

				break;
			}
		}
		if (ntd) {
			ntd.stop();
			document.getElementsByClassName('key')[n].style = '';
		}
		var n = stop[i];
		genEvent.send('noteStop', n);
		document.getElementsByClassName('key')[n].style = '';
	}
	for (let i in start) {
		var n = start[i];
		genEvent.send('noteStart', n);

		document.getElementsByClassName('key')[n].style.backgroundColor = 'red';

		//playingnotes.unshift({ sound: 1, note: n })
	}
}