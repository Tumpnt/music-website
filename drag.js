interact('#piano')
	.resizable({
		edges: { left: false, right: false, bottom: false, top: true },
		modifiers: [
			// keep the edges inside the parent
			interact.modifiers.restrictEdges({
				outer: 'parent',
				endOnly: true
			}),
		],
	})
	.on('resizemove', function (event) {
		var target = event.target
		// update the element's style
		if (event.rect.height < 56) {
			target.style['font-size'] = '0px'
			if (event.rect.height < 40)
				target.style.height = 0 + 'px'
			else
				target.style.height = event.rect.height + 'px'
		}
		else {
			target.style['font-size'] = 'initial'
			target.style.height = event.rect.height + 'px'
		}
		target.children[0].style.width = event.rect.height + 'px'
	})
var npanewidth = 50
interact('#nodepane')
	.resizable({
		edges: { left: true, right: false, bottom: false, top: false },
		modifiers: [
			// keep the edges inside the parent
			interact.modifiers.restrictEdges({
				outer: 'parent',
				endOnly: true
			}),
		],
	})
	.on('resizemove', function (event) {
		var target = event.target.style
		npanewidth = (event.dx / window.innerWidth) * 100 + npanewidth
		// update the element's style
		if (npanewidth < 10)
			target.webkitTransform = target.transform = 'translateX(0%)'
		else if (npanewidth > 90)
			target.webkitTransform = target.transform = 'translateX(100%) translateX(-4px)'
		else
			target.webkitTransform = target.transform = 'translateX(' + npanewidth + '%)'
	})
	.on('up', function (event) {
		if (npanewidth < 10)
			npanewidth = 0
		else if (npanewidth > 90)
			npanewidth = 100
	})