
var ipsTracker = {
	chromeStorageKey: 'DXTrkrIn_ShipmentIds',
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
	var input = document.getElementById('inputShipmentId');
	
	var shipmentId = input.value;
	console.log("Adding id:", shipmentId);
	
	chrome.storage.sync.get([ipsTracker.chromeStorageKey], function(result) {
		console.log(result);
		result.DXTrkrIn_ShipmentIds = result.DXTrkrIn_ShipmentIds?result.DXTrkrIn_ShipmentIds:[];
		
		if(result.DXTrkrIn_ShipmentIds.indexOf(shipmentId) == 1) {
			console.log("ShipmentId already in list:", shipmentId);
		} else {
			result.DXTrkrIn_ShipmentIds.unshift(shipmentId);
		}
		
		console.log(result.DXTrkrIn_ShipmentIds);
		
		chrome.storage.sync.remove([ipsTracker.chromeStorageKey], function(){
			console.log("Chrome Storage cleared...");
			var jsonObj = {};
			jsonObj[ipsTracker.chromeStorageKey] = result.DXTrkrIn_ShipmentIds;
			chrome.storage.sync.set(jsonObj, function() {
				console.log("Saved a new ShipmentId");
			});
		});
	});
  },
  removeAllShipmentIds: function(event) {
	chrome.storage.sync.remove([ipsTracker.chromeStorageKey], function(){
		console.log("Chrome Storage cleared...");
	});
  },
  /**
   * Sends an XHR GET request to grab photos of lots and lots of kittens. The
   * XHR's 'onload' event is hooks up to the 'showPhotos_' method.
   *
   * @public
   */
  requestLatestStatus: function(shipmentIds) {
	shipmentIds.forEach(this.requestLatestStatusForAShipmentId_, this);
  },
  /**
   * Function to initiate an Ajax call to fetch IPS Tracker Status page
   * @private
   */
  requestLatestStatusForAShipmentId_: function(shipmentId, index) {
    var req = new XMLHttpRequest();
	var ipsUrl = this.searchOnIpsWeb_ +  encodeURIComponent(shipmentId); 
	console.log(ipsUrl);
	
    req.open("GET", ipsUrl, true);
    req.onload = this.showStatus_.bind(this);
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
  showStatus_: function (e) {

	var shipmentStatus = this.parseIpsPage_(e.target.responseText);
	
	console.log(shipmentStatus);

	var respDiv = document.createElement('div');
	
	var aDiv = document.createElement('div');
	aDiv.innerHTML = e.target.responseText;
	

	var getQueryVariable = function (queryString, variable)
	{
		var vars = queryString.split("&");
		for (var i=0;i<vars.length;i++) {
			var pair = vars[i].split("=");
			if(pair[0] == variable) {
				return pair[1];
			}
		}
		return(false);
	};
	
	//Overwrite shipmentId to handle scenarios where we werent able to parse out a shipmentId from page HTML.
	shipmentStatus.shipmentId = getQueryVariable(e.target.responseURL, 'itemid')
	
	//Verify if this is a valid response from IPSTracker
	if(shipmentStatus.isValid){
		var hdrRowNode = document.createElement('h1');
				hdrRowNode.className = "shipmentId";
				hdrRowNode.innerHTML = shipmentStatus.shipmentId;
		
		var latestStatusNode = document.createElement('div');
				latestStatusNode.className = "statusRow";

		if(shipmentStatus.hasShipped) {
			//Valid Shipment Status table
			var hdrs = shipmentStatus.headers;
			var shipmentEvents = shipmentStatus.statusChangeEvents;
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
			latestStatusNode.innerHTML = shipmentStatus.extraMsg;
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
	//Bind the button event handlers
	document.getElementById('btnAddShipmentId').addEventListener('click', ipsTracker.addAShipmentId);
	document.getElementById('btnRemoveAllShipmentIds').addEventListener('click', ipsTracker.removeAllShipmentIds);
	
	//Hardcoding a test shipmentId
	//chrome.storage.sync.set({'DXTrkrIn_ShipmentIds': ["RP300236557SG"] }, function() {
	//	console.log("Saved a new ShipmentId");
	//});
	
	//Invoked when underlying storage modified - shipmentId added or all removed.
	//Problemo: This gets invoked twice when we clear and update for adding a shipmentId causing the UI to go blank and refresh
	chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (key in changes) {
          var storageChange = changes[key];
          console.log('Storage key "%s" in namespace "%s" changed. ' +
                      'Old value was "%s", new value is "%s".',
                      key,
                      namespace,
                      storageChange.oldValue,
                      storageChange.newValue);
        }
		//Refresh the page with new shipmentIds or clear if none
		chrome.storage.sync.get([ipsTracker.chromeStorageKey], function(result) {
			if(result.DXTrkrIn_ShipmentIds) {
				ipsTracker.requestLatestStatus(result.DXTrkrIn_ShipmentIds)
			} else {
				document.getElementById('shipmentStatusDiv').innerHTML = "";
			}
		});
    });
	
	//Fetch from underlying storage and update page if shipmentIds present
	chrome.storage.sync.get([ipsTracker.chromeStorageKey], function(result) {
		console.log(result);
		if(result.DXTrkrIn_ShipmentIds) {
			ipsTracker.requestLatestStatus(result.DXTrkrIn_ShipmentIds)
		}
	});
	
	ga('create', 'UA-58206751-1', 'auto');
	ga('send', 'pageview');
});

//Setup Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','https://ssl.google-analytics.com/ga.js','ga');