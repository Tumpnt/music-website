class EventHandler {
	constructor() {
		this.listeners = {}
	}

	add(type, callback) {
		if (!(type in this.listeners))
			this.listeners[type] = []
		this.listeners[type].push(callback)
	}
	remove(type, callback) {
		if (type) {
			if (!(type in this.listeners)) return
			if (callback) {
				var stack = this.listeners[type]
				for (var i in stack) {
					if (stack[i] === callback) {
						stack.splice(i, 1)
						return
					}
				}
			}
			else this.listeners[type] = []
		}
		else this.listeners = {}
	}
	send(event, ...params) {
		if (!(event in this.listeners)) return true
		var stack = this.listeners[event].slice()

		for (var i in stack)
			stack[i].call(this, ...params)
	}
}

var genEvent = new EventHandler()