
var ipsTracker = {
  /**
   * 
   * @type {string}
   * @private
   */
	searchOnIpsWeb_: 'http://ipsweb.ptcmysore.gov.in/ipswebtracking/IPSWeb_item_events.asp?' +
		'Submit=Submit' + '&' +
		'itemid=',

	addAShipmentId: function(event) {
		var form = document.getElementById('formAddShipmentId');
		var shipmentId = document.getElementById('inputShipmentId').value.trim();
		var label = document.getElementById('userLabel').value.trim();
		
		var shipment = {
			'shipmentId': shipmentId,
			'label': label
		};
		
		console.log("Adding:", shipment);
		
		var message = {extensionKey: "dxin"};
		message["operation"] = "add";
		message["shipmentToAdd"] = shipment;
		chrome.runtime.sendMessage(message, function(response) {
			  console.log(response.status);
		});
	},
	removeAllShipmentIds: function(event) {
		var message = {extensionKey: "dxin"};
		message["operation"] = "deleteAll";
		chrome.runtime.sendMessage(message, function(response) {
			console.log(response.status);
		});
	},
	refreshPopUp: function(){
		//Fetch from underlying storage and update page if shipmentIds present
		var message = {extensionKey: "dxin"};
		message["operation"] = "getAll";
		chrome.runtime.sendMessage(message, function(shipments){
			console.log("Got shipments:", shipments);
			ipsTracker.requestLatestStatus(shipments);
		});
	},
  /**
   * Sends an XHR GET request to grab photos of lots and lots of kittens. The
   * XHR's 'onload' event is hooks up to the 'showPhotos_' method.
   *
   * @public
   */
  requestLatestStatus: function(shipments) {
	document.getElementById('shipmentStatusDiv').innerHTML = "";
	if(shipments){
		shipments.forEach(this.requestLatestStatusForAShipmentId_, this);
	}
  },
  /**
   * Function to initiate an Ajax call to fetch IPS Tracker Status page
   * @private
   */
  requestLatestStatusForAShipmentId_: function(shipment, index) {
    var req = new XMLHttpRequest();
	var ipsUrl = this.searchOnIpsWeb_ +  encodeURIComponent(shipment.shipmentId); 

	console.log(ipsUrl);
	
    req.open("GET", ipsUrl, true);
    req.onload = this.showStatus_.bind(this, shipment);
    req.send(null);
  },

  /**
   * Handle the 'onload' event of our XHR request, generated in
   * 'requestLatestStatus', by parsing the response HTML and stuffing 
   * relevant parts into the document for display.
   *
   * @param {ProgressEvent} e The XHR ProgressEvent.
   * @private
   */
  showStatus_: function (shipment, e) {

	var shipStatFrmIps = this.parseIpsPage_(e.target.responseText);
	console.log(shipStatFrmIps);

	var respDiv = document.createElement('div');
	
	var aDiv = document.createElement('div');
	aDiv.innerHTML = e.target.responseText;
	
	var getQueryVariable = function (queryString, variable){
		var vars = queryString.split("&");
		for (var i=0;i<vars.length;i++) {
			var pair = vars[i].split("=");
			if(pair[0] == variable) {
				return pair[1];
			}
		}
		return(false);
	};
	
	//Overwrite shipmentId to handle scenarios where we were not able to parse out a shipmentId from page HTML.
	shipStatFrmIps.shipmentId = shipment.shipmentId;//getQueryVariable(e.target.responseURL, 'itemid')
	shipStatFrmIps.shipmentLabel = shipment.label?shipment.label:shipment.shippedOnDate;
	
	//Verify if this is a valid response from IPSTracker
	if(shipStatFrmIps.isValid){
		var hdrRowNode = document.createElement('h1');
				hdrRowNode.className = "shipmentId";
				hdrRowNode.innerHTML = "<a href='"+e.target.responseURL+"' target='_blank'>"+shipStatFrmIps.shipmentId + "</a>" + 
				" - [" + shipStatFrmIps.shipmentLabel + "]";
		
		var latestStatusNode = document.createElement('div');
				latestStatusNode.className = "statusRow";

		if(shipStatFrmIps.hasShipped) {
			//Valid Shipment Status table
			var hdrs = shipStatFrmIps.headers;
			var shipmentEvents = shipStatFrmIps.statusChangeEvents;
			var latestStatus = shipmentEvents[shipmentEvents.length-1];

			var lastStatusHtml = "";
			for (var i=0; i < hdrs.length; i++) {
				lastStatusHtml = lastStatusHtml + 
								"<div class='row'>" +
								"<span class='hdr'>"+ hdrs[i] +"</span>" +
								"<span class='val'>"+ latestStatus[i] +"</span>" +
								"</div>";
			}

			latestStatusNode.innerHTML = lastStatusHtml;
		} else {
			//ShipmentId not found on IPS yet!!!
			latestStatusNode.innerHTML = shipStatFrmIps.extraMsg;
		}
		respDiv.appendChild(hdrRowNode);
		respDiv.appendChild(latestStatusNode);

    } else {
		var errorMsg = document.createElement('div');
		errorMsg.innerHTML = 'Failed to get response from IPS Tracker...';
		respDiv.appendChild(errorMsg);
	}
    document.getElementById('shipmentStatusDiv').appendChild(respDiv);
  },
  parseIpsPage_ : function(htmlTxt) {
  
	var regexShipmentId = /([A-Z])\w+/g;
	
	var parseShipmentHdrRow_ = function(aHdrRowElem) {		
		var tds = aHdrRowElem.querySelectorAll('td');
		var arrHdrs = [];
		
		for (var i=0; i< tds.length; i++) {
			var txt = tds[i].innerHTML;
			arrHdrs.push(txt);
		}
		jsonStatus['headers'] = arrHdrs;
	};
	var parseShipmentStatusRow_ = function(aRowElem, index) {
		var tds = aRowElem.querySelectorAll('td');
		var arrVals = [];
		
		for (var i=0; i< tds.length; i++) {
			var txt = tds[i].innerHTML;
			arrVals.push(txt);
		}
		jsonStatus['statusChangeEvents'].push(arrVals);
	};
	
	//Stuff the response in a DOM node so that we can run CSS selector queries.
	var elem = document.createElement('div');
	elem.innerHTML = htmlTxt;
	
	//The shipment status information in JSON format
	var jsonStatus = {} ;
	jsonStatus['isValid'] = false;
	
	if (elem.querySelector('title').innerHTML == 'IPS Web Tracking/Item Events') {
		jsonStatus['isValid'] = true;
		
		var resultTable = elem.querySelectorAll('table')[3];

		if(resultTable) {
			jsonStatus['hasShipped'] = true;
			var resultRows = resultTable.querySelectorAll('tr');
		
			jsonStatus['shipmentId'] = resultRows[0].innerText.match(regexShipmentId)[1];
		
			var shipmentStatusHdr = Array.prototype.slice.call(resultRows, 1, 2);
			var shipmentStatusRows = Array.prototype.slice.call(resultRows,2);

			shipmentStatusHdr.forEach(parseShipmentHdrRow_);
		
			jsonStatus['statusChangeEvents'] = [];
			shipmentStatusRows.forEach(parseShipmentStatusRow_);
		} else if (elem.querySelectorAll('p')[1].innerText == 'No information, please check your item identifier ') {
			jsonStatus['hasShipped'] = false;
			jsonStatus['extraMsg'] = "No information, please check your item identifier";
		}
		
	}
	return jsonStatus;
  }
};

//Fetch all shipment status as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
	
	//Setup the popup with text values from 
	document.title = manifest.name;
	document.getElementById('labelExtName').innerText = manifest.name + " [v"+manifest.version+"]";
	
	//Bind the button event handlers
	document.getElementById('btnAddShipmentId').addEventListener('click', ipsTracker.addAShipmentId);
	document.getElementById('btnRemoveAllShipmentIds').addEventListener('click', ipsTracker.removeAllShipmentIds);
	
	ipsTracker.refreshPopUp();
	
	//Setup Google Analytics
	ga('create', 'UA-58206751-1', 'auto');
	ga('send', 'pageview');
});

//Invoked when underlying storage modified - shipmentId added or all removed.
chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (var key in changes) {
	  var storageChange = changes[key];
	  console.log('Storage key "%s" in namespace "%s" changed. ' +
				  'Old value was "%s", new value is "%s".',
				  key,
				  namespace,
				  storageChange.oldValue,
				  storageChange.newValue);
	}
	ipsTracker.refreshPopUp();
});

//Google Analytics Script modified for Chrome Extensions
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments);},i[r].l=1*new Date();a=s.createElement(o);
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
	})(window,document,'script','https://ssl.google-analytics.com/ga.js','ga');
	
//Fetching values from manifest.json
var manifest = chrome.runtime.getManifest();