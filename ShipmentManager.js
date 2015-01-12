chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log(sender.tab ?
					"from a content script:" + sender.tab.url :
					"from the extension");
		if (request.extensionKey == "dxin") {
			switch(request.operation){
			case "add":
				console.log(request.shipmentToAdd);
				console.log(request.otherShipments);
				storageManager.saveShipment(request.shipmentToAdd);
				break;
			case "deleteAll": 
				storageManager.removeAllShipments();
				break;
			default:
				sendResponse({status: "Operation unknown."});
			}
			sendResponse({status: "Operation received."});
		}
	});
	

var storageManager = {
	chromeStorageKey: 'DXTrkrIn_Shipments',
	
	saveShipment: function(shipment){
		chrome.storage.sync.get([storageManager.chromeStorageKey], function(result) {
			console.log(result);
			result.DXTrkrIn_Shipments = result.DXTrkrIn_Shipments?result.DXTrkrIn_Shipments:[];
			
			//if(result.DXTrkrIn_Shipments.indexOf(shipmentId) == 1) {
			//	console.log("ShipmentId already in list:", shipmentId);
			//} else {
				result.DXTrkrIn_Shipments.unshift(shipment);
			//}
	
			console.log(result.DXTrkrIn_Shipments);
	
			chrome.storage.sync.remove([storageManager.chromeStorageKey], function(){
				console.log("Chrome Storage cleared...");
				var jsonObj = {};
				jsonObj[storageManager.chromeStorageKey] = result.DXTrkrIn_Shipments;
				chrome.storage.sync.set(jsonObj, function() {
					console.log("Saved a new ShipmentId");
				});
			});
		});
	},
	removeAllShipments: function(){
		chrome.storage.sync.remove([storageManager.chromeStorageKey], function(){
			console.log("Chrome Storage cleared...");
		});
	},
	
	lastElement:"JustAPlaceholder without a comma"
};