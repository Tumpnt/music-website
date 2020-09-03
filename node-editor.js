"use strict";

//Create Editor
//create instance
events.on('init', async function () {
	const numSocket = new Rete.Socket('Number');
	const noteSocket = new Rete.Socket('Notes');
	const soundSocket = new Rete.Socket('Sound');
	const actionSocket = new Rete.Socket('Action');

	class InComponent extends Rete.Component {
		constructor() {
			super('Input');
			function runReset(task, event) {
				return function (note) {
					task.run({ event, note });
					task.reset();
				};
			}
			let eventListeners;
			this.task = {
				outputs: { notes: 'option', pitch: 'output', },
				init(task) {
					if (eventListeners) {
						eventListeners.forEach(e => events.off(...e));
						console.log('events deleted', eventListeners);
					}
					eventListeners = [
						['noteStart', runReset(task, 'start')],
						['noteStop', runReset(task, 'stop')],
					];
					eventListeners.forEach(e => events.on(...e));
					console.log('events made', eventListeners);
				}
			};
		}

		builder(node) {
			node
				.addOutput(new Rete.Output('notes', 'Notes', noteSocket))
				.addOutput(new Rete.Output('pitch', 'Pitch', numSocket));
			//.addOutput(new Rete.Output('start', 'Start', actionSocket))
			//.addOutput(new Rete.Output('stop', 'Stop', actionSocket));
		}

		worker(node, inputs, data) {
			this.closed = ['pitch'];
			console.log(data);
			return {
				notes: { note: data.note, action: data.event },
				pitch: (2 ** ((data.note - 57) / 12)) * songpitch,
			};
		}
	}


	class OutComponent extends Rete.Component {
		constructor() {
			super('Output');
			this.task = {
				outputs: {},
			};
		}

		builder(node) {
			node
				.addInput(new Rete.Input('sound', 'Sound', soundSocket));
		}

		worker(node, inputs) {
			console.log('outNode', inputs);
			if (inputs) {
				if (inputs.sound && inputs.sound[0]) {
					console.log('outNode', inputs.sound);
					inputs.sound[0].connect(context.destination);
				}
			}
		}
	}

	class TestComponent extends Rete.Component {
		constructor() {
			super('Test');
			this.task = {
				outputs: {}
			};
		}

		builder(node) {
			node
				.addInput(new Rete.Input('value', 'Value', numSocket))
				.addInput(new Rete.Input('run', 'Run', actionSocket));
		}

		worker(node, inputs, data) {
			if (inputs.value)
				console.log(...inputs.value);
		}
	}

	class OscComponent extends Rete.Component {
		constructor() {
			super('Oscillator');
			this.task = {
				outputs: { sound: 'option' },
			};
			this.notes = [];
		}

		builder(node) {
			node
				.addOutput(new Rete.Output('sound', 'Sound', soundSocket))
				.addInput(new Rete.Input('notes', 'Notes', noteSocket))
				.addInput(new Rete.Input('pitch', 'Pitch', numSocket));
			//.addInput(new Rete.Input('start', 'Start', actionSocket))
			//.addInput(new Rete.Input('stop', 'Stop', actionSocket));
		}

		worker(node, inputs, data) {
			this.closed = [];
			console.log({ inputs, data });
			if (data.event) {
				if (inputs.notes[0]) {
					if (data.event == "start") {
						this.component.osc = context.createOscillator();
						this.component.osc.type = "sine";
						this.component.osc.frequency.setTargetAtTime(inputs.pitch[0], context.currentTime, 0);
						this.component.osc.start();
						this.component.notes.push({ note: data.note, osc: this.component.osc });
						return { sound: this.component.osc };
					} else {
						let keptNotes = [];
						this.component.notes.forEach(function (o) {
							if (o.note == data.note)
								o.osc.stop();
							else
								keptNotes.push(o);
						});
						this.component.notes = keptNotes;
					}
				}
				console.log(data);
			} else {
				this.component.notes.forEach(o => o.osc.stop());
				this.component.notes = [];
			}
		}
	}



	//initialize editor
	const container = document.querySelector('#rete');

	const editor = new Rete.NodeEditor('demo@0.1.0', container);
	editor.use(ConnectionPlugin.default);
	editor.use(VueRenderPlugin.default);
	editor.use(TaskPlugin);

	var engine = new Rete.Engine('demo@0.1.0');

	let components = [new InComponent(), new OutComponent(), new TestComponent(), new OscComponent()];
	components.forEach(c => {
		editor.register(c);
		engine.register(c);
	});


	var nodepages = [];
	async function newNode(t, p, x, y) { //type, page, x,y
		var tn = await components[t].createNode();
		tn.position = [x, y];
		editor.addNode(tn);
		if (!nodepages[p])
			nodepages[p] = [];
		nodepages[p].push(tn);
	}


	//preset Nodes
	await newNode(0, 0, 0, 0);
	await newNode(3, 0, 200, 0);
	await newNode(1, 0, 350, 0);

	editor.connect(nodepages[0][0].outputs.get('notes'), nodepages[0][1].inputs.get('notes'));
	editor.connect(nodepages[0][0].outputs.get('pitch'), nodepages[0][1].inputs.get('pitch'));

	editor.connect(nodepages[0][1].outputs.get('sound'), nodepages[0][2].inputs.get('sound'));

	editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
		if (editor.silent) return;
		await engine.abort();
		await engine.process(editor.toJSON());
		console.log('compiled', editor.toJSON());
	});

	engine.on('error', ({ message, data }) => {
		console.log(message);
		console.log(data);
	});

	editor.trigger('process');
});