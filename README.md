DxInTracker
===========

Chrome Extension for tracking DX.com shipments to India.

<a href="https://chrome.google.com/webstore/detail/dx-shipment-tracker-for-i/kcdlapnkooffcjoamidhdbbcepoibbdj" target="_blank">
<img src="https://raw.githubusercontent.com/nirmaljpatel/DxInTracker/master/other_assets/Install%20Button.png" alt="Install button for DX Shipment Tracker for India">
</a>

This is mostly a learning exercise for myself to understand the Chrome Extension development ecosystem and its capabilities.

##Features:
1. [x] [**Browser Action**](https://developer.chrome.com/extensions/browserAction) Popup
  1. [x] Manage ShipmentIds to be tracked - Add and delete all.
  2. [x] Fetch shipment data HTML page from IPS Tracking server using [**XHR**](https://developer.chrome.com/extensions/xhr) and parse into JSON.
  3. [x] Displays latest event for each shipment in the popup.
2. [x] Uses [**Chrome Storage and Sync**](https://developer.chrome.com/extensions/storage) to synchronize added shipmentIds across computers.
3. [ ] Allow adding ShipmentIds from DX.com order details page using [**Content Scripts**](https://developer.chrome.com/extensions/content_scripts)
4. [x] **[OmniBox](https://developer.chrome.com/extensions/omnibox) integration** to search for shipments
  1. [x] Enter the keyword "**dxin**" to activate DxInTracker then search for ShipmentIds on IPS portal.
  2. [x] Suggests matches from saved shipmentIds as you type.
  3. [x] Accepting a suggestion or pressing enter opens a new tab with result page from IPS portal.
5. [ ] **UX** - Improve the Interface and Usability
  1. [ ] Pre-build table based on ShipmentIds being tracked before initiating shipment status requests.
  2. [ ] Loading animation when refreshing status.
  3. [ ] Cache last query results.
  4. [ ] Proactive notification to users by detecting changes in shipment info.
  5. [ ] Ability to delete individual ShipmentIds.
  6. [x] Hyperlinks to IPS search site.
  7. [x] Allow user to enter a custom description label for each shipmentId.
6. [ ] [**Analytics**](https://developer.chrome.com/apps/analytics)
  1. [x] Integrated with Google analytics .
  2. [ ] Identify and track more events based on usage patterns.
7. [ ] An [**Options**](https://developer.chrome.com/extensions/options) page
  1. [ ] Option to turn-off using Chrome Sync
  2. [ ] Option to turn-off Add to from Shipment page

