var context
var songpitch = 440
var playingnotes = []

sarpntEventHandler.addEventListener("start", function () {
	context = new AudioContext()
})

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
		var pitch = (2 ** ((start[i] - 57) / 12)) * songpitch
		var nn = context.createOscillator()
		nn.connect(context.destination)
		nn.type = "sine"
		nn.frequency.setTargetAtTime(pitch, context.currentTime, 0)
		nn.start()

		playingnotes.unshift({ sound: nn, note: start[i] })
	}
}