
            document.addEventListener('DOMContentLoaded', function () {
              $(window).on("load", function() {
                  setTimeout(() => {
                      dataLayer.push({
                          ecommerce: null
                      }); // Clear the previous ecommerce object.
                      dataLayer.push({
                          event: "view_item",
                          ecommerce: {
                              value: 154.02,
                              currency: "USD",
                              items: [{
                                  item_name: '19x23x4a Air Filter',
                                  item_id: 'FKFB19X23X4A-6',
                                  id: 'FKFB19X23X4A-6',
                                  currency: "USD",
                                  price: 25.67,
                                  item_brand: "Filter King",
                                  item_category: 'Filters',
                                  item_category2: '4-Inch Filter',
                                  item_category4: '6 Pack',
                                  item_variant: 'MERV 8',
                                  quantity: '6',
                                  google_business_vertical: 'retail'
                              }],
                              items_google_ads: [{
                                  id: 'FKFB19X23X4A-6',
                                  price: 154.02,
                                  quantity: 1,
                              }]
                          }
                      });

                      // Facebook Pixels Tracking
                      if (typeof fbq !== "undefined") {
                          fbq('track', 'ViewContent', {
                              value: '154.02',
                              currency: 'USD',
                              content_name: '19x23x4a',
                              content_ids: 'FB19X23X4A', // Required for Dynamic Product Ads,
                              content_type: 'product', // Required for Dynamic Product Ads,
                              content_category: 'air_filter',
                          });
                      }
                  }, 4000);
              });
            });
        