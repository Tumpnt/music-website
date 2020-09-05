"use strict";

//Create Editor
//create instance
events.on('init', async function () {
	const numSocket = new Rete.Socket('Number'),
		noteSocket = new Rete.Socket('Notes'),
		soundSocket = new Rete.Socket('Sound'),
		actionSocket = new Rete.Socket('Action');

	class InComponent extends Rete.Component {
		constructor() {
			super('Input');
			function sendNote(task, event) {
				return function (note) {
					task.run({ event, note });
					task.reset();
				};
			}
			let eventListeners;
			this.task = {
				outputs: { notes: ['option', 'output'], pitch: 'output', },
				init(task) {
					if (eventListeners) {
						eventListeners.forEach(e => events.off(...e));
					}
					eventListeners = [
						['noteStart', sendNote(task, 'start')],
						['noteStop', sendNote(task, 'stop')],
					];
					eventListeners.forEach(e => events.on(...e));
				}
			};
		}

		builder(node) {
			node
				.addOutput(new Rete.Output('notes', 'Notes', noteSocket))
				.addOutput(new Rete.Output('pitch', 'Pitch', numSocket));
			//.addOutput(new Rete.Output('start', 'Start', actionSocket))
			//.addOutput(new Rete.Output('stop', 'Stop', actionSocket))
		}

		worker(node, inputs, data) {
			this.closed = [];
			let pitch = 2 ** ((data.note - 57) / 12) * songPitch;
			return {
				notes: { note: data.note, pitch, action: data.event },
				pitch,
			};
		}
	}
	class OutComponent extends Rete.Component {
		constructor() {
			super('Output');
			//this.connected = [];
			this.task = {
				outputs: {},
				/*init() {
					this.connected.forEach(e => e.disconnect);
					this.connected = [];
				}*/
			};
		}

		builder(node) {
			node
				.addInput(new Rete.Input('sound', 'Sound', soundSocket));
		}

		worker(node, inputs) {
			for (let s of inputs.sound || []) {
				s.connect && s.connect.forEach(n =>
					n.connect(audioCtx.destination)
					//this.component.connected.push(n);
				);
				s.disconnect && s.disconnect.forEach(n =>
					n.disconnect(audioCtx.destination)
					//this.component.connected =
					//	this.component.connected.filter(e => e != n);
				);
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
			this.notes = [];
			this.stopNote = function (o) {
				o.osc.stop();
			};
			this.task = {
				outputs: { sound: ['option', 'output'] },
				init() {
					this.notes.forEach(this.stopNote);
					this.notes = [];
				}
			};
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
			let r = { sound: { connect: [], disconnect: [] } };
			for (let note of inputs.notes || []) {
				if (note.action == "start") {
					let osc = audioCtx.createOscillator();
					osc.type = "sine";
					osc.frequency.setTargetAtTime(note.pitch, audioCtx.currentTime, 0);
					osc.start();
					this.component.notes.push({ note: note.note, osc });
					r.sound.connect.push(osc);
				} else {
					let keptNotes = [];
					let removedNotes = [];
					this.component.notes.forEach(o => {
						if (o.note == note.note) {
							this.component.stopNote(o);
							removedNotes.push(o);
						} else
							keptNotes.push(o);
					});
					this.component.notes = keptNotes;
					r.sound.disconnect = r.sound.disconnect.concat(removedNotes);
				}
			}
			return r;
		}
	}

	// initialize editor
	const container = document.querySelector('#rete');
	const components = [new InComponent(), new OutComponent(), new TestComponent(), new OscComponent()];
	let editors = [];

	function newEditor(id) {
		id = `instrument@${id}.0.0`; // bad workaround, probably modify rete code instead
		let e = {};
		e.editor = new Rete.NodeEditor(id, container);
		e.editor.use(ConnectionPlugin.default);
		e.editor.use(VueRenderPlugin.default);
		e.editor.use(TaskPlugin.default);
		e.engine = new Rete.Engine(id);
		components.forEach(c => {
			e.editor.register(c);
			e.engine.register(c);
		});
		e.start = function () {
			e.editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
				if (e.editor.silent) return;
				await e.engine.abort();
				await e.engine.process(e.editor.toJSON());
				console.log('compiled', e.editor.toJSON());
			});
			e.engine.on('error', console.error);
			e.editor.trigger('process');
			delete e.start;
		};
		return e;
	}

	async function newNode(t, p, x, y) { // type, editorid, x,y
		let n = await components[t].createNode();
		n.position = [x, y];
		editors[p].editor.addNode(n);
		if (!editors[p].nodes)
			editors[p].nodes = [];
		editors[p].nodes.push(n);
	}

	// testing stuff
	editors.push(newEditor(editors.length));
	await newNode(0, 0, 0, 0);
	await newNode(3, 0, 200, 0);
	await newNode(1, 0, 350, 0);

	editors[0].editor.connect(editors[0].nodes[0].outputs.get('notes'), editors[0].nodes[1].inputs.get('notes'));
	editors[0].editor.connect(editors[0].nodes[1].outputs.get('sound'), editors[0].nodes[2].inputs.get('sound'));

	editors.forEach(e => e.start());
});