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
		var target = event.target
		var width = event.rect.width / window.innerWidth * 100
		// update the element's style
		if (width < 10)
			target.style.width = 0 + '%'
		else {
			if (width > 90)
				target.style.width = 100 + '%'
			else
				target.style.width = width + '%'
		}
	})