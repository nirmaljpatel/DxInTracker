chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log(sender.tab ?
					"from a content script:" + sender.tab.url :
					"from the extension");
		if (request.extensionKey == "dxin") {
			console.log("Operation:", request.operation);
			switch(request.operation){
			case "add":
				console.log(request.shipmentToAdd);
				console.log(request.otherShipments);
				storageManager.saveShipment(request.shipmentToAdd);
				sendResponse({status: "Operation received."});
				break;
			case "deleteAll": 
				storageManager.removeAllShipments();
				sendResponse({status: "Operation received."});
				break;
			case "getAll":
				storageManager.getAllShipments(sendResponse);
				return true; //Return true here so that we can invoke sendResponse later asynchronously
				break;
			default:
				sendResponse({status: "Operation unknown."});
			}
			return false;
		}
	});

var storageManager = {
	chromeStorageKey: 'DXTrkrIn_Shipments',
	
	saveShipment: function(shipment){
		chrome.storage.sync.get([storageManager.chromeStorageKey], function(result) {
			console.log(result);
			var shipments = result[storageManager.chromeStorageKey]?result[storageManager.chromeStorageKey]:[];
			
			for(var i=0; i<shipments.length; i++){
				if(shipments[i].shipmentId == shipment.shipmentId){
					console.log("Duplicate shipmentId");
					return;
				}
			}
			shipments.unshift(shipment);
			
			var jsonObj = {};
			jsonObj[storageManager.chromeStorageKey] = shipments;
			chrome.storage.sync.set(jsonObj, function() {
				console.log("Saved a new ShipmentId");
			});
		});
		
	},
	removeAllShipments: function(){
		chrome.storage.sync.remove([storageManager.chromeStorageKey], function(){
			console.log("Chrome Storage cleared...");
		});
	},
	getAllShipments: function(hndlrForShipments) {
		chrome.storage.sync.get([storageManager.chromeStorageKey], function(result) {
			console.log(result);
			var shipments = result[storageManager.chromeStorageKey];
			//Invoke callback irrespective of shipments found or not
			hndlrForShipments(shipments);
		});
	},
	
	lastElement:"JustAPlaceholder without a comma"
};