DxInTracker
===========

Chrome Extension for tracking DX.com shipments to India.

[Extension Page in Chrome WebStore](https://chrome.google.com/webstore/detail/dx-shipment-tracker-for-i/kcdlapnkooffcjoamidhdbbcepoibbdj)

This is mostly a learning exercise for me to learn how to write a Chrome Extension.

##Features:
1. [**Browser Action**](https://developer.chrome.com/extensions/browserAction)
  1. Allows to add ShipmentIds manually in the popup.
  2. Displays latest event for each shipment in the popup.
2. Uses Chrome sync to sync added shipmentIds across computers.

##To Do:
1. [ ] **Better UI** interface for the Browser Action popup
  1. [ ] Pre-built table based on ShipmentIds being tracked
  2. [ ] Loading animation when refreshing status.
  3. [ ] Cache last query results
  4. [ ] Ability to delete individual ShipmentIds.
2. [ ] Allow adding ShipmentIds from DX.com order details page using [**Content Scripts**](https://developer.chrome.com/extensions/content_scripts).
3. [ ] **[OmniBox](https://developer.chrome.com/extensions/omnibox) integration** to search for shipments.
