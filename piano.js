//piano key generation
{
	let key
	for (let i = 0; i < 132; i++) {
		key = document.createElement("SPAN")
		key.setAttribute("note", i)
		if ([1, 3, 6, 8, 10].indexOf(i % 12) > -1)
			key.setAttribute("class", "black")
		else {
			if (i % 12 == 0) {
				let key2 = document.createElement("SPAN")
				key2.innerHTML = (i / 12)
				key.appendChild(key2)
			}
			key.setAttribute("class", "white")
		}
		$("#piano *")[0].appendChild(key)
	}
}