/**************************************************************************
 * Chrome Omnibox Integration
 **************************************************************************/
var suggestion = {
	description: "Enter a ShipmentId to search on IPS site."
 };
chrome.omnibox.setDefaultSuggestion(suggestion);

//TODO:Code - Should not repeat these everywhere. Move them to a shared module.
var chromeStorageKey = "DXTrkrIn_ShipmentIds";
var searchOnIpsWeb = 'http://ipsweb.ptcmysore.gov.in/ipswebtracking/IPSWeb_item_events.asp?' +
	  'Submit=Submit' + '&' +
	  'itemid=';

var findInArray = function(key, array) {
	key = key.toUpperCase();
	var results = [];
	for (var i = 0; i < array.length; i++) {
		if (array[i].indexOf(key) == 0) {
			//TODO:Code - Keep this function to find matching elements only and do the custom array creation independently.
			results.push({content: array[i] + "", description: array[i] +" - Match from your saved ShipmentIds in DxInTracker."});
		}
	}
	return results;
}
var StoredShipmentIds = [];
// This event is fired only once for each input session.
chrome.omnibox.onInputStarted.addListener(function(){
	console.group("Omnibox.onInputStarted");
	chrome.storage.sync.get([chromeStorageKey], function(result) {
		console.log(result);
		StoredShipmentIds = result.DXTrkrIn_ShipmentIds?result.DXTrkrIn_ShipmentIds:[];
	});
	console.log(StoredShipmentIds);
	console.groupEnd();
});
// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    console.log('inputChanged: ' + text);
	var savedMatches = findInArray(text, StoredShipmentIds);
    suggest(savedMatches);
  });

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    console.log('inputEntered: ' + text);
	//TODO:Feature - Offer to save this ShipmentId if not already in saved list
	
	chrome.tabs.create({
		selected: true,
		url: searchOnIpsWeb + text
	});
});