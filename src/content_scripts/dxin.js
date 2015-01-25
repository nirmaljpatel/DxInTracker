console.log("Executing DxIn.js...");

var addShipmentBtnHndlr = function(e) {
	var message = {
		extensionKey: "dxin",
		operation: "add"
	};
	
	var shipmentId = e.target.parentElement.innerText.trim();
	var shippedOnDate = e.target.parentElement.parentElement.firstElementChild.innerText.trim();
	
	var shipment = {
		"shipmentId": shipmentId,
		"shippedOnDate": shippedOnDate
	};
	
	message["shipmentToAdd"] = shipment;
	message["otherShipments"] = [];
	
	var otherRows = e.target.parentElement.parentElement.parentElement.querySelectorAll("tr");
	
	for (var i = 1; i<otherRows.length; i++){
		var othrShipmentId = otherRows[i].querySelectorAll("td")[2].innerText.trim();
		var othrShippedOnDate = otherRows[i].querySelectorAll("td")[0].innerText.trim();
		if (shipmentId != othrShipmentId) {
			var othrShipment = {
				"shipmentId": othrShipmentId,
				"shippedOnDate": othrShippedOnDate
			};
			message["otherShipments"].push(othrShipment);
		}
	}
	
	
	chrome.runtime.sendMessage(message, function(response) {
		console.log(response.status);
	});
};

$("a[href='#order_ShipmentsInfo']").click(function(){
	console.log("ShipmentInfo Tab clicked...");
	var triggerFunc = setInterval(function(){
		var orderInfoTables = $(".orderinfo_table");
		console.log(orderInfoTables.length);
		if(orderInfoTables.length > 1) {
			clearInterval(triggerFunc);
			var shipmentTbl = orderInfoTables[1];
			var rows = $(shipmentTbl).find("tr").get();
			for(var i=1; i < rows.length; i++) {
				var aDiv = document.createElement('div');
				aDiv.className = "AddToDxInBtn";
				
				//Code for displaying <extensionDir>/images/myimage.png:
				var imgURL = chrome.extension.getURL("images/addBtn_128x128.png");
				aDiv.style.backgroundImage = "url("+imgURL+")";
				
				aDiv.addEventListener("click", addShipmentBtnHndlr);
				//document.getElementById("someImage").src = imgURL;
				
				var shipmentRow = rows[i].querySelectorAll("td")[2];
				var brNode = shipmentRow.querySelector("br");
				shipmentRow.insertBefore(aDiv, brNode);
			}
		}
	}, 500);
});