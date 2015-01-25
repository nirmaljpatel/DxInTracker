//Fetching values from manifest.json
var manifest = chrome.runtime.getManifest();

//Setup the popup with text values from 
document.getElementById('extName').innerText = manifest.name + " [v"+manifest.version+"]";