'use strict';
/**
 * Globalne spremenljivke 
 */

var Demo;
/*
*Funkcije za platno, ter loadanje(Demo).
*
*
*/
function Init() {
	var canvas = document.getElementById('gl-surface');
	var gl = canvas.getContext('webgl');
	if (!gl) {
		gl = canvas.getContext('experimental-webgl');
	}
	if (!gl) {
		alert('Probi Firefox');
		return;
	}

	Demo = new LightMapDemoScene(gl);
	Demo.Load(function (demoLoadError) {
		if (demoLoadError) {
			alert('Poglej konzolo, neki ne stima');
			console.error(demoLoadError);
		} else {
			Demo.Begin();
		}
	});
}

