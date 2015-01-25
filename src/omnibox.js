/**************************************************************************
 * Chrome Omnibox Integration
 **************************************************************************/
var suggestion = {
	description: "Enter a ShipmentId to search on IPS site."
 };
chrome.omnibox.setDefaultSuggestion(suggestion);

var searchOnIpsWeb = 'http://ipsweb.ptcmysore.gov.in/ipswebtracking/IPSWeb_item_events.asp?' +
	  'Submit=Submit' + '&' +
	  'itemid=';
	  
//Providing a default decorator which returns back the passed argument as is
var noDecorator = function(obj) {
	return obj;
};
var findInArray = function(key, array, decorator) {
	decorator = decorator || noDecorator;
	key = key.toUpperCase();
	var results = [];
	for (var i = 0; array && i < array.length; i++) {
		if (array[i].shipmentId.indexOf(key) == 0) {
			results.push(decorator(array[i]));
		}
	}
	return results;
}

var buildOmniBoxSuggestResult = function(key, desc) {
	var suggestResult = {
		content: key,
		description: desc
	};
	return suggestResult;
};
var StoredShipments = [];

// This event is fired only once for each input session.
chrome.omnibox.onInputStarted.addListener(function(){
	console.group("Omnibox.onInputStarted");
	storageManager.getAllShipments(function(shipments){
			console.log("Got shipments:", shipments);
			StoredShipments = shipments;
		});
	console.log(StoredShipments);
	console.groupEnd();
});
// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
	console.group("omnibox.onInputChanged");
	console.log('inputChanged: ' + text);
	var savedMatches = findInArray(text, StoredShipments, function (shipment){
		return buildOmniBoxSuggestResult(shipment.shipmentId, shipment.shipmentId + " ["+(shipment.label?shipment.label:shipment.shippedOnDate)+"]");
	});
	if(savedMatches.length == 0) {
		savedMatches = [buildOmniBoxSuggestResult(" ", "No matches with saved shipments.")];
	}
	suggest(savedMatches);
	console.groupEnd();
});

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(function(text) {
	console.group("omnibox.onInputEntered");
	console.log('inputEntered: ' + text);
	//TODO:Feature - Offer to save this ShipmentId if not already in saved list
	//TODO:Feature - RegExp match to confirm its a ShipmentId
	chrome.tabs.create({
		selected: true,
		url: searchOnIpsWeb + text
	});
	console.groupEnd();
});

chrome.omnibox.onInputCancelled.addListener(function(){
	console.group("omnibox.onInputCancelled");
	console.groupEnd();
});