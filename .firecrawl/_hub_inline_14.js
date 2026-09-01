
    document.addEventListener('DOMContentLoaded', function () {
      $(window).on("load", function() {
        setTimeout(() => {
          let item = {
            "ProductID": "FB19X23X4A",
            "SKU": "FB19X23X4A",
            "ProductName": "19x23x4 MERV 8 Air filter",
            "Quantity": 6,
            "MervType": "merv-8",
            "ItemPrice": "25.67",
            "RowTotal": "154.02",
            "ProductURL": "https://filterking.com/air-filter-sizes/19x23x4a?type_slug=merv-8",
            "ImageURL": "https://filterking.com/img/filters/pdp/merv-8-thin-rectangle-1pack.webp",
            "ProductCategories": ["Air Filter"]
          }

          window._learnq = window._learnq || [];
          window._learnq.push(["track", "Viewed Product", item]);
        }, 6000);
      });
    });
  