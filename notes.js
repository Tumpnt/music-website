var context
var midikeyoctave = 4
var songpitch = 440
var midikey = {
	z: 0,
	s: 1,
	x: 2,
	d: 3,
	c: 4,
	v: 5,
	g: 6,
	b: 7,
	h: 8,
	n: 9,
	j: 10,
	m: 11,
	',': 12,
	l: 13,
	'.': 14,
	';': 15,
	'/': 16,
	q: 12,
	2: 13,
	w: 14,
	3: 15,
	e: 16,
	r: 17,
	5: 18,
	t: 19,
	6: 20,
	y: 21,
	7: 22,
	u: 23,
	i: 24,
	9: 25,
	o: 26,
	0: 27,
	p: 28,
	'[': 29,
	'=': 30,
	']': 31
}
var midiin = {}

function() {
	context = new AudioContext()

	var playingnotes = []

	function updatenotes(start, stop) {
		for (let i in stop) {
			var notetodelete
			for (let ii in playingnotes) {
				if (playingnotes[ii].note == stop[i]) {
					notetodelete = playingnotes[ii].sound
					playingnotes.splice(ii, 1)

					break
				}
			}
			if (notetodelete) {
				notetodelete.stop()
			}
		}
		for (let i in start) {
			var pitch = (2 ** (start[i] - 57 / 12)) * songpitch
			var nn = context.createOscillator()
			nn.connect(context.destination)
			nn.type = "sine"
			nn.frequency.setTargetAtTime(pitch, context.currentTime, 0)
			nn.start()

			playingnotes.unshift({ sound: nn, note: start[i] })
		}
	}

	addEventListener("keydown", press);
	addEventListener("keyup", unpress);

	function press(key) {
		if (midikey[key.key] != undefined) {
			var note = midikey[key.key] + midikeyoctave * 12
			for (let i in playingnotes) {
				if (playingnotes[i].note == note) {
					return
				}
			}
			updatenotes([note], [])
		}
	}

	function unpress(key) {
		if (midikey[key.key] != undefined) {
			var note = midikey[key.key] + midikeyoctave * 12
			updatenotes([], [note])
		}
	}
});



WebMidi.enable(function (err) {
	if (err) {
		console.log("Could not access your MIDI devices.", err);
		return;
	}
	console.log("This browser supports WebMIDI!");

	var inputs = WebMidi.inputs;
	var outputs = WebMidi.outputs;
	for (var input of inputs) {
		input.addListener("noteon", "all", NoteOn);
		input.addListener("noteoff", "all", NoteOff);
	}
});

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
		note: note.name + note.octave,
		velocity,
		id: note.number
	});
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
}