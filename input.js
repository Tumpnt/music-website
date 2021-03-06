"use strict";

let midikey = {
	KeyZ: 0, KeyS: 1, KeyX: 2, KeyD: 3, KeyC: 4, KeyV: 5, KeyG: 6, KeyB: 7, KeyH: 8, KeyN: 9, KeyJ: 10, KeyM: 11, Comma: 12, KeyL: 13, Period: 14, Semicolon: 15, Slash: 16, KeyQ: 12, Digit2: 13, KeyW: 14, Digit3: 15, KeyE: 16, KeyR: 17, Digit5: 18, KeyT: 19, Digit6: 20, KeyY: 21, Digit7: 22, KeyU: 23, KeyI: 24, Digit9: 25, KeyO: 26, Digit0: 27, KeyP: 28, BracketLeft: 29, Equal: 30, BracketRight: 31
};
let heldKeys = []; // for keyboard input

events.on("init", function () {
	addEventListener("keydown", press);
	addEventListener("keyup", unpress);

	WebMidi.enable(function (err) {
		if (err) {
			console.error("Could not access your MIDI devices.", err);
			return;
		}
		console.log("This browser supports WebMIDI!");

		let inputs = WebMidi.inputs;
		let outputs = WebMidi.outputs;
		for (let input of inputs) {
			input.addListener("noteon", "all", NoteOn);
			input.addListener("noteoff", "all", NoteOff);
		}
	});
});

function press({ code: key }) {
	if (midikey[key] != undefined && !heldKeys.includes(key)) {
		heldKeys.push(key);
		let note = midikey[key] + document.getElementById('midikeyoctave').value * 12;
		updatenotes([note], []);
	}
}

function unpress({ code: key }) {
	if (midikey[key] != undefined) {
		heldKeys = heldKeys.filter(e => e != key);
		let note = midikey[key] + document.getElementById('midikeyoctave').value * 12;
		updatenotes([], [note]);
	}
}

function NoteOn({
	target,
	data,
	timestamp,
	channel,
	type,
	note,
	velocity,
	rawVelocity
}) {
	console.log("NoteOn", {
		channel,
		note: note.name + note.octave,
		velocity,
		id: note.number
	});
	updatenotes([note.number], []);
}

function NoteOff({
	target,
	data,
	timestamp,
	channel,
	type,
	note,
	velocity,
	rawVelocity
}) {
	console.log("NoteOff", {
		note: note.name + note.octave,
		id: note.number
	});
	updatenotes([], [note.number]);
}
