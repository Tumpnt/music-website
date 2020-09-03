"use strict";

let resize = function () {
	document.body.style.width = `${window.innerWidth}px`;
	document.body.style.height = `${window.innerHeight}px`;
};
window.addEventListener('resize', resize);
resize();