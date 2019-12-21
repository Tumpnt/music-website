//Create Editor
//create instance
const numSocket = new Rete.Socket('Number value')

class NumComponent extends Rete.Component {
	constructor() {
		super('Number')
	}

	builder(node) {
		let out = new Rete.Output('num', 'Number', numSocket)

		node.addOutput(out)
	}

	worker(node, inputs, outputs) {
		outputs['num'] = node.data.num
	}
}

//Initialise Editor
sarpntEventHandler.addEventListener('start', async function () {
	const container = document.querySelector('#rete')
	const components = [new NumComponent()]


	const editor = new Rete.NodeEditor('demo@0.1.0', container)
	editor.use(ConnectionPlugin.default)
	editor.use(VueRenderPlugin.default)


	const engine = new Rete.Engine('demo@0.1.0')
	components.map(c => {
		editor.register(c)
		engine.register(c)
	})

	//preset Nodes
	var n1 = await components[0].createNode({ num: 2 })

	n1.position = [80, 200]
	editor.addNode(n1)

	editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
		console.log('process')
		await engine.abort()
		await engine.process(editor.toJSON())
	})

    editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async() => {
        console.log('process');
        await engine.abort();
        await engine.process(editor.toJSON());
    });

    editor.view.resize();
    editor.trigger('process');
})
