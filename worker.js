//const Module = require('./index.js')
//import createModule from './index.js'

onmessage = function(e) 
{
	const f = e.data[0];
	
	//importScripts('handler.js');
	//const js = document.createElement('script');
	//js.async = true;
	//js.src = "index.js";
	//document.body.appendChild(js);

	//FS.mkdir('/work');
	//e.mount(WORKERFS, { files: [f] }, '/work');
	FS.mount(WORKERFS, { files: [f] }, '/work');
	//Module.FS.mount(WORKERFS, { files: [f] }, '/work');

	console.log(Module.read_file('/work/' + f.name));
}
self.importScripts('index.js');
