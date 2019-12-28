var context
var songpitch = 440
var playingnotes = []

genEvent.add("init", function () {
	context = new AudioContext()
})

function updatenotes(start, stop) {
	for (let i in stop) {
		/*var ntd
		var n = stop[i]
		for (let ii in playingnotes) {
			var s = playingnotes[ii]
			if (s.note == n) {
				ntd = s.sound
				playingnotes.splice(ii, 1)

				break
			}
		}
		if (ntd) {
			ntd.stop()
			$('.key')[n].style = {}
		}*/
		var n = stop[i]
		genEvent.send('noteStop', n)
		$('.key')[n].style = {}
	}
	for (let i in start) {
		var n = start[i]
		genEvent.send('noteStart', n)

		$('.key')[n].style['background-color'] = 'red'

		//playingnotes.unshift({ sound: 1, note: n })
	}
}