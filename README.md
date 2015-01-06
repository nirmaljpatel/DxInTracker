DxInTracker
===========

Chrome Extension for tracking DX.com shipments to India.

[Extension in Chrome WebStore](https://chrome.google.com/webstore/detail/dx-shipment-tracker-for-i/kcdlapnkooffcjoamidhdbbcepoibbdj)

This is mostly a learning exercise for me to learn how to write a Chrome Extension.

##Features:
1. [x] [**Browser Action**](https://developer.chrome.com/extensions/browserAction)
  1. [x] Allows to add ShipmentIds manually in the popup.
  2. [x] Displays latest event for each shipment in the popup.
2. [x] Uses [**Chrome Storage and Sync**](https://developer.chrome.com/extensions/storage) to synchronize added shipmentIds across computers.
3. [ ] Allow adding ShipmentIds from DX.com order details page using [**Content Scripts**](https://developer.chrome.com/extensions/content_scripts).
4. [ ] **[OmniBox](https://developer.chrome.com/extensions/omnibox) integration** to search for shipments.
5. [ ] **UX** - Improve the Interface and Usability
  1. [ ] Pre-built table based on ShipmentIds being tracked
  2. [ ] Loading animation when refreshing status.
  3. [ ] Cache last query results
  4. [ ] Ability to delete individual ShipmentIds.

