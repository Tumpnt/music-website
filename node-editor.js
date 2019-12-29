//Create Editor
//create instance
genEvent.add('init', async function () {
	const numSocket = new Rete.Socket('Number')
	const soundSocket = new Rete.Socket('Sound')
	const actionSocket = new Rete.Socket('Action')

	class InComponent extends Rete.Component {
		constructor() {
			super('Input')
			this.task = {
				outputs: { start: 'option', stop: 'option', note: 'output', pitch: 'output' },
				init(task) {
					console.log(['task',task])
					console.log(['run',task.run()])
				}
			}
			console.log(['this',this])

			genEvent.add('noteStart',
				function (note) {
					task.run({ event: 'start', note })
					task.reset()
				}
			)
			genEvent.add('noteStop',
				function (note) {
					task.run({ event: 'stop', note })
					task.reset()
				}
			)
		}

		builder(node) {
			node
				.addOutput(new Rete.Output('note', 'Note', numSocket))
				.addOutput(new Rete.Output('pitch', 'Pitch', numSocket))
				.addOutput(new Rete.Output('start', 'Start', actionSocket))
				.addOutput(new Rete.Output('stop', 'Stop', actionSocket))
		}

		worker(node, inputs, data) {
			this.closed = []//'note', 'pitch']
			if (data.event == 'start') {
				this.closed.push('stop')
			}
			else {
				this.closed.push('start')
			}
			return {
				note: data.note,
				pitch: (2 ** ((data.note - 57) / 12)) * songpitch
			}
		}
	}


	class OutComponent extends Rete.Component {
		constructor() {
			super('Output')
			this.task = {
				outputs: {},
				init(task) {
					task.run()
					task.reset()
				}
			}
		}

		builder(node) {
			node
				.addInput(new Rete.Input('sound', 'Sound', soundSocket))
		}

		worker(node, inputs) {
			console.log('out test')
			if (inputs.sound)
				console.log(inputs)
			//connect to context.destination
		}
	}

	class TestComponent extends Rete.Component {
		constructor() {
			super('Test')
			this.task = {
				outputs: {}
			}
		}

		builder(node) {
			node
				.addInput(new Rete.Input('value', 'Value', numSocket))
				.addInput(new Rete.Input('run', 'Run', actionSocket))
		}

		worker(node, inputs) {
			console.log(inputs.value[0])
		}
	}

	class OscComponent extends Rete.Component {
		constructor() {
			super('Oscillator')
			this.task = {
				outputs: { sound: 'output' },
			}
			this.osc = context.createOscillator()
		}

		builder(node) {
			node
				.addOutput(new Rete.Output('sound', 'Sound', soundSocket))
				.addInput(new Rete.Input('pitch', 'Pitch', numSocket))
				.addInput(new Rete.Input('start', 'Start', actionSocket))
		}

		worker(node, inputs) {
			this.closed = []
			this.component.osc.type = "sine"
			if (inputs.pitch)
				this.component.osc.frequency.setTargetAtTime(inputs.pitch[0], context.currentTime, 0)
			console.log('fuck')
			console.log(this.component.osc)
			return { sound: this.component.osc }
		}
	}



	//initialize editor
	const container = document.querySelector('#rete')

	const editor = new Rete.NodeEditor('demo@0.1.0', container)
	editor.use(ConnectionPlugin.default)
	editor.use(VueRenderPlugin.default)
	editor.use(TaskPlugin)

	var engine = new Rete.Engine('demo@0.1.0')

	const components = [new InComponent(), new OutComponent(), new TestComponent(), new OscComponent()]
	components.map(c => {
		editor.register(c)
		engine.register(c)
	})


	var nodepages = []
	async function newNode(t, p, x, y) { //type, page, x,y
		var tn = await components[t].createNode()
		tn.position = [x, y]
		editor.addNode(tn)
		if (!nodepages[p])
			nodepages[p] = []
		nodepages[p].push(tn)
	}


	//preset Nodes
	await newNode(0, 0, 0, 0)
	await newNode(2, 0, 200, 150)
	await newNode(3, 0, 200, 0)
	await newNode(1, 0, 350, 0)
	//editor.connect(nodepages[0][0].outputs.get('note'), nodepages[0][1].inputs.get('value'))
	//editor.connect(nodepages[0][0].outputs.get('start'), nodepages[0][1].inputs.get('run'))

	//editor.connect(nodepages[0][0].outputs.get('pitch'), nodepages[0][2].inputs.get('pitch'))
	//editor.connect(nodepages[0][0].outputs.get('start'), nodepages[0][2].inputs.get('start'))

	//editor.connect(nodepages[0][2].outputs.get('sound'), nodepages[0][3].inputs.get('sound'))

	editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
		if (editor.silent) return
		await engine.abort()
		await engine.process(editor.toJSON())
	})

	engine.on('error', ({ message, data }) => {
		console.log(message)
		console.log(data)
	})

	editor.trigger('process')
})