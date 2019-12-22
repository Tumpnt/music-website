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
			//notetodelete.stop()
			$('.key')[stop[i]].style = {}
		}
	}
	for (let i in start) {
		//nn.start()

		$('.key')[start[i]].style['background-color'] = 'red'

		playingnotes.unshift({ sound:1, note: start[i] })
	}
}