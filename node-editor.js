//Create Editor
//create instance
const numSocket = new Rete.Socket('Number')
const soundSocket = new Rete.Socket('Sound')
const actionSocket = new Rete.Socket('Action')

class InComponent extends Rete.Component {
	constructor() {
		super('Input')
		this.task = {
			outputs: {act: 'option', key: 'output'},
			init(task){
			  genEvent.remove();
			  genEvent.add('keydown', function (e) {
				 task.run(e.keyCode);
				 task.reset();
			  });
			}
		 }
	}

	builder(node) {
		node.addOutput(new Rete.Output('note', 'Note', numSocket))
		node.addOutput(new Rete.Output('pitch', 'Pitch', numSocket))
		node.addOutput(new Rete.Output('start', 'Start', actionSocket))
		node.addOutput(new Rete.Output('stop', 'Stop', actionSocket))
	}

	worker(node, inputs, outputs) {
		outputs['note'] = 0
		outputs['pitch'] = (2 ** ((outputs['note'] - 57) / 12)) * songpitch
		outputs['start'] = 0
		outputs['stop'] = 0
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
const components = [new InComponent(), new OutComponent(), new OscComponent()]

async function newNode(t, p, x, y) { //type, page, x,y
	var tn = await components[t].createNode()
	tn.position = [x, y]
	editor.addNode(tn)
	if (!nodepages[p])
		nodepages[p] = []
	nodepages[p].push(tn)
}
//Initialise Editor
genEvent.add('init', async function () {

	editor.use(ConnectionPlugin.default)
	editor.use(VueRenderPlugin.default)

	const engine = new Rete.Engine('demo@0.1.0')
	components.map(c => {
		editor.register(c)
	})


	//preset Nodes
	await newNode(0, 0, 0, 0)
	await newNode(2, 0, 150, 0)
	await newNode(1, 0, 300, 0)
	editor.connect(nodepages[0][0].outputs.get('pitch'), nodepages[0][1].inputs.get('pitch'))
	editor.connect(nodepages[0][1].outputs.get('sound'), nodepages[0][2].inputs.get('sound'))

	editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
		await engine.abort()
		await engine.process(editor.toJSON())
	})

	editor.trigger('process')
})