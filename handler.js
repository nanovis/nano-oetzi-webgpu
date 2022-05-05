var Module;
(async () => 
{
	Module = {
		preRun: [],
		postRun: [],
		print: (function() 
		{
			return function(text) 
			{
				text = Array.prototype.slice.call(arguments).join(' ');
				console.log(text);
			};
		})(),
		printErr: function(text) 
		{
			text = Array.prototype.slice.call(arguments).join(' ');
			console.error(text);
		},
		canvas: (function() 
		{
			var canvas = document.getElementById('canvas');
			//canvas.addEventListener("webglcontextlost", function(e) { alert('FIXME: WebGL context lost, please reload the page'); e.preventDefault(); }, false);
			return canvas;
		})(),
		setStatus: function(text) 
		{
			console.log("status: " + text);
		},
		monitorRunDependencies: function(left) 
		{
			// no run dependencies to log
		},
		onRuntimeInitialized: function() 
		{
			console.log("initialized");            
		}
	};
	window.onerror = function() 
	{
		console.log("onerror: " + event);
	};

	// Initialize the graphics adapter
	{
		const adapter = await navigator.gpu.requestAdapter();
		if (!adapter)
		{
			alert('Could not retrieve GPU adapter.')
			return; 
		}
		const device = await adapter.requestDevice();
		if (!device)
		{
			alert('Could not retrieve GPU device.')
			return; 
		}
		Module.preinitializedWebGPUDevice = device;
	}

	{
		const js = document.createElement('script');
		js.async = true;
		js.src = "index.js";
		document.body.appendChild(js);
	}
})();

let reader = new FileReader();

//function load_TransferFunctions()
//{
//	let files = document.getElementById('myTranserFunctions').files;
//	for (let i = 0; i < files.length; i++) {
//		let file = files[i];
//		reader.addEventListener('loadend', transferFunctionFileInput);
//		reader.readAsArrayBuffer(file);
//	}
//}

function transferFunctionFileInput(fileInput) 
{
	if (fileInput.files.length == 0) {
		return;
	}

	for (let i = 0; i < fileInput.files.length; i++) 
	{
		let fr = new FileReader();
		let file = fileInput.files[i];	

		fr.onload = function () 
		{
			var data = new Uint8Array(fr.result);
			FS.writeFile(file.name, data);
			Module.loadTransferFunction(file.name);
			fileInput.value = '';
		};
		fr.readAsArrayBuffer(file);
	}		
}

function chooseClippingPlane(elem)
{
	Module.chooseClippingPlane(elem.value);
}


const worker = new Worker("worker.js");


function getFileFromList(fileInput, name)
{
	for (var i = 0; i < fileInput.length; i += 1)
	{
		var file = fileInput[i];
		if(file.name == name)
		{
			return file;
		}
	}
	return null;
}

function useFileInputChunks(fileInput)
{
	if (fileInput.files.length == 0) {
		return;
	}
	
	var configFile = getFileFromList(fileInput.files, 'config.json');
	
	if(configFile == null)
	{
		alert('no config.json found');
		return;
	}
	
	var reader = new FileReader();
	reader.onload = function(event) 
	{
		var configJson = JSON.parse(event.target.result);
		//	console.log('File content:', event.target.result);
		
		for (var i = 0; i < configJson.files.length; i += 1)
		{
			let volumeDescr = configJson.files[i];
			let readerB = new FileReader();
			readerB.onload = function(event)
			{
				//console.log('File content:', event.target.result);
				let volumeDescrJson = JSON.parse(event.target.result);
				let volumeDataFile = getFileFromList(fileInput.files, volumeDescrJson.file);
				worker.postMessage([volumeDataFile]);
			}			
			readerB.readAsText(getFileFromList(fileInput.files, volumeDescr));
		}
	};
	reader.readAsText(configFile);
			
	
	//var file = fileInput.files[0];
	//FS.WorkerFS.attachRemoteListener(worker);
	//worker.postMessage([file], FS);
	//worker.postMessage([file]);
}

function useFileInputChunksOld(fileInput)
{
	var byteIndex = 0;
	var chunks = [];
	var chunksAmount = 10000;

	for (var i = 0; i < chunksAmount; i += 1)
	{
		var byteEnd = Math.ceil((file.size / chunksAmount) * (i + 1));
		var chunk = file.slice(byteIndex, byteEnd)
		chunks.push(chunk);
		byteIndex += (byteEnd - byteIndex);
	}
}


function useFileInput(fileInput) 
{
	if (fileInput.files.length == 0) {
		return;
	}
	
	Module.start_app();

	var loadingGif = document.getElementById('loadingcontainer'); 
	loadingGif.style.display = 'block';
	var loadCounter = 0;
	var numFiles = fileInput.files.length;
	for (let i = 0; i < numFiles; i++) 
	{
		let fr = new FileReader();
		let file = fileInput.files[i];

		fr.onload = function () 
		{
			var data = new Uint8Array(fr.result);

			FS.writeFile(file.name, data);

			fileInput.value = '';
			loadCounter++;
			if(loadCounter == numFiles)
			{
				Module.open_volume();
			}
		};
		fr.readAsArrayBuffer(file);
	}
}

function uploadAnnotations(elem) 
{
	Module.save_annotations();
	alert('Todo: implement');
	const annotationJson = Module.FS.readFile('annotation.json', { encoding: 'utf8' });
	console.log(annotationJson);
}

function downloadTF(which) 
{
	var color = document.getElementById('tf0_color').value;
	var hex_code = color.split("");
	var	red = parseInt(hex_code[1]+hex_code[2],16);
	var	green = parseInt(hex_code[3]+hex_code[4],16);
	var	blue = parseInt(hex_code[5]+hex_code[6],16);
	
	
	var jsonData = { 
		"rampLow": document.getElementById('tf0_ramp_low').value / 100.0,
		"rampHigh": document.getElementById('tf0_ramp_high').value / 100.0,
		"color": {
			"x": red,
			"y": green,
			"z": blue} }
	download(JSON.stringify(jsonData), "test.json", "text/plain");
}


async function download(content, fileName, contentType) 
{
	if( window.showSaveFilePicker ) 
	{
		const opts = 
		{
			suggestedName: "transferFunction.json",
			types: [
			{
				description: 'json file'
			}
			]
		};
		const handle = await showSaveFilePicker(opts);
		const writable = await handle.createWritable();
		await writable.write( content );
		writable.close();
	}
	else
	{
		var a = document.createElement("a");
		var file = new Blob([content], {type: contentType});
		a.href = URL.createObjectURL(file);
		a.download = fileName;
		a.click();
	}
}

async function saveScreenshot(event)
{
	//const image = await new Promise( (res) => canvas.toBlob( res ) );
	let canvas = document.getElementById('canvas');
	let image = canvas.toDataURL('image/jpeg');
	if( window.showSaveFilePicker ) 
	{
		const opts = 
		{
			suggestedName: "screenshot.jpg",
			types: [
			{
				description: 'jpeg file'
			}
			]
		};
		const handle = await showSaveFilePicker(opts);
		const writable = await handle.createWritable();
		await writable.write( image );
		writable.close();
	}
	else 
	{
		const saveImg = document.createElement( "a" );
		saveImg.href = URL.createObjectURL( image );
		saveImg.download= "image.png";
		saveImg.click();
		setTimeout(() => URL.revokeObjectURL( saveImg.href ), 60000 );
	}
}

function adjustTransferFunction(elem) 
{
	let parent = elem.parentNode;
	let tfIndex = 0;
	let ramp_low = 0;
	let ramp_high = 0;
	var red = 0;
	var green = 0;
	var blue = 0;
	if(parent.id == 'tf0') 
	{
		tfIndex = 0;
		ramp_low = document.getElementById('tf0_ramp_low').value / 100.0;
		ramp_high = document.getElementById('tf0_ramp_high').value / 100.0;
		
		var hex_code = document.getElementById('tf0_color').value.split("");
		red = parseInt(hex_code[1]+hex_code[2],16);
		green = parseInt(hex_code[3]+hex_code[4],16);
		blue = parseInt(hex_code[5]+hex_code[6],16);
		//var rgb = red+","+green+","+blue;
	};
	if(parent.id == 'tf1') 
	{
		tfIndex = 1;
		ramp_low = document.getElementById('tf1_ramp_low').value / 100.0;
		ramp_high = document.getElementById('tf1_ramp_high').value / 100.0;
		
		var hex_code = document.getElementById('tf1_color').value.split("");
		red = parseInt(hex_code[1]+hex_code[2],16);
		green = parseInt(hex_code[3]+hex_code[4],16);
		blue = parseInt(hex_code[5]+hex_code[6],16);
	};
	if(parent.id == 'tf2') 
	{
		tfIndex = 2;
		ramp_low = document.getElementById('tf2_ramp_low').value / 100.0;
		ramp_high = document.getElementById('tf2_ramp_high').value / 100.0;
		
		var hex_code = document.getElementById('tf2_color').value.split("");
		red = parseInt(hex_code[1]+hex_code[2],16);
		green = parseInt(hex_code[3]+hex_code[4],16);
		blue = parseInt(hex_code[5]+hex_code[6],16);
	};

	Module.adjustTransferFunction(tfIndex, ramp_low, ramp_high, red, blue, green);
}

	
function setAnnotationKernelSize(elem) 
{
	Module.setAnnotationKernelSize(elem.value);
}
function clipVolume(elem) 
{
	Module.clip_volume(elem.checked, elem.value);
}

function aoEnabledHandler(elem) 
{
	Module.enableAO(elem.checked);
}

function updateMask(fileInput) 
{
	var loadingGif = document.getElementById('loadingcontainer'); 
	loadingGif.style.display = 'block';
	var numFiles = fileInput.files.length;
	let fr = new FileReader();
	let file = fileInput.files[0];
	var which = document.getElementById('updateMaskWhich').value

	fr.onload = function () 
	{
		var data = new Uint8Array(fr.result);
		var name = 'new_mask.raw';
		FS.writeFile(name, data);

		fileInput.value = '';
		Module.update_mask(which);
	};
	fr.readAsArrayBuffer(file);	
}

function enableVolume(which) 
{
	Module.enable_volume(which);
}

function updateColor(picker) 
{		
	var hex_code = picker.value.split("");
	red = parseInt(hex_code[1]+hex_code[2],16);
	green = parseInt(hex_code[3]+hex_code[4],16);
	blue = parseInt(hex_code[5]+hex_code[6],16);
	Module.setColor(red / 255, green / 255, blue / 255);
}     
