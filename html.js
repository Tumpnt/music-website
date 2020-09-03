"use strict";

/**
 * generate piano
 */
for (let i = 0; i < 132; i++) {
	let key = document.createElement("span");
	key.setAttribute("note", i);
	if ([1, 3, 6, 8, 10].indexOf(i % 12) > -1)
		key.setAttribute("class", "key black");
	else {
		if (i % 12 == 0) {
			let key2 = document.createElement("span");
			key2.innerHTML = (i / 12);
			key.appendChild(key2);
		}
		key.setAttribute("class", "key white");
	}
	document.querySelector("#piano>div").appendChild(key);
}

/**
 * element styling
 */

/*document.querySelectorAll(".fitinput").forEach(e => 
	e.addEventListener("input", function () {
		e.style.width = 
	})
)*/

/**
 * interactjs
 */

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
		var target = event.target;
		// update the element's style
		if (event.rect.height < 56) {
			target.style.fontSize = `0px`;
			if (event.rect.height < 40)
				target.style.height = `0px`;
			else
				target.style.height = `${event.rect.height}px`;
		} else {
			target.style.fontSize = 'initial';
			target.style.height = `${event.rect.height}px`;
		}
		target.children[0].style.width = `${event.rect.height}px`;
	});
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
		var target = event.target;
		var width = event.rect.width / window.innerWidth * 100;
		// update the element's style
		if (width < 10)
			target.style.width = `0%`;
		else if (width > 90)
			target.style.width = `100%`;
		else
			target.style.width = `${width}%`;
	});