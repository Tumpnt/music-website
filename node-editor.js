//Create Editor
//create instance
const numSocket = new Rete.Socket('Number')
const soundSocket = new Rete.Socket('Sound')

class InComponent extends Rete.Component {
	constructor() {
		super('Input')
	}

	builder(node) {
		node.addOutput(new Rete.Output('note', 'Note', numSocket))
	}

	worker(node, inputs, outputs) {
		outputs['note'] = 0
	}
}

class OutComponent extends Rete.Component {
	constructor() {
		super('Output')
	}

	builder(node) {
		node.addInput(new Rete.Input('sound', 'Sound', soundSocket))
	}

	worker(node, inputs, outputs) {
		if (inputs['sound'])
			inputs['sound'].connect(context.destination)
	}
}

class PitchComponent extends Rete.Component {
	constructor() {
		super('Note to Pitch')
	}

	builder(node) {
		node.addOutput(new Rete.Output('pitch', 'Pitch', numSocket))
		node.addInput(new Rete.Input('note', 'Note', numSocket))
	}

	worker(node, inputs, outputs) {
		outputs['pitch'] = (2 ** ((inputs['note'] - 57) / 12)) * songpitch
	}
}

class OscComponent extends Rete.Component {
	constructor() {
		super('Oscillator')
	}

	builder(node) {
		node.addOutput(new Rete.Output('sound', 'Sound', soundSocket))
		node.addInput(new Rete.Input('pitch', 'Pitch', numSocket))
	}

	worker(node, inputs, outputs) {
		outputs['sound'] = 0
	}
}
var n1
//Initialise Editor
sarpntEventHandler.addEventListener('start', async function () {
	const container = document.querySelector('#rete')
	const components = [new InComponent(), new OutComponent(), new PitchComponent, new OscComponent()]
	const editor = new Rete.NodeEditor('demo@0.1.0', container)
	editor.use(ConnectionPlugin.default)
	editor.use(VueRenderPlugin.default)

	const engine = new Rete.Engine('demo@0.1.0')
	components.map(c => {
		editor.register(c)
	})
	

	//preset Nodes
	n1 = await components[0].createNode()
	n1.position = [0, 0]
	editor.addNode(n1)
	n1 = await components[2].createNode()
	n1.position = [250, 0]
	editor.addNode(n1)
	n1 = await components[3].createNode()
	n1.position = [500, 0]
	editor.addNode(n1)
	n1 = await components[1].createNode()
	n1.position = [750, 0]
	editor.addNode(n1)

	editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
		await engine.abort()
		await engine.process(editor.toJSON())
	})

	editor.view.resize()
	editor.trigger('process')
})