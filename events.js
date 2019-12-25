class EventHandler {
	constructor() {
		this.listeners = {}
	}

	addEventL(type, callback) {
		if (!(type in this.listeners)) {
			this.listeners[type] = []
		}
		this.listeners[type].push(callback)
	}
	removeEventL(type, callback) {
		if (!(type in this.listeners)) {
			return
		}
		var stack = this.listeners[type]
		for (var i = 0, l = stack.length; i < l; i++) {
			if (stack[i] === callback) {
				stack.splice(i, 1)
				return
			}
		}
	}
	sendEvent(event, ...params) {
		if (!(event in this.listeners)) {
			return true
		}
		var stack = this.listeners[event].slice()

		for (var i = 0, l = stack.length; i < l; i++) {
			stack[i].call(this, ...params)
		}
	}
}

var genEvent = new EventHandler()