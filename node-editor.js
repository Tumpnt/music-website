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
		var osc = context.createOscillator()
		osc.type = "sine"
		osc.frequency.setTargetAtTime(inputs['pitch'], context.currentTime, 0)
		outputs['sound'] = osc
	}
}

const container = document.querySelector('#rete')
const editor = new Rete.NodeEditor('demo@0.1.0', container)
var nodepages = []
const components = [new InComponent(), new OutComponent(), new PitchComponent, new OscComponent()]

async function newNode(t, p, x, y) { //type, page, x,y
	var tn = await components[t].createNode()
	tn.position = [x,y]
	editor.addNode(tn)
	if (!nodepages[p])
		nodepages[p] = []
	nodepages[p].push(tn)
}
//Initialise Editor
sarpntEventHandler.addEventListener('start', async function () {

	editor.use(ConnectionPlugin.default)
	editor.use(VueRenderPlugin.default)

	const engine = new Rete.Engine('demo@0.1.0')
	components.map(c => {
		editor.register(c)
	})
	

	//preset Nodes
	await newNode(0, 0, 0, 0)
	await newNode(2, 0, 150, 0)
	await newNode(3, 0, 300, 0)
	await newNode(1, 0, 450, 0)
	editor.connect(nodepages[0][0].outputs.get('note'),nodepages[0][1].inputs.get('note'))
	editor.connect(nodepages[0][1].outputs.get('pitch'),nodepages[0][2].inputs.get('pitch'))
	editor.connect(nodepages[0][2].outputs.get('sound'),nodepages[0][3].inputs.get('sound'))

	editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
		await engine.abort()
		await engine.process(editor.toJSON())
	})
	
	editor.trigger('process')
})