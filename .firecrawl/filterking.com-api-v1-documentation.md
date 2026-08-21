[Filter King\|API Reference](https://filterking.com/)

v1.2

API Reference

[Authentication](https://filterking.com/api/v1/documentation#authentication) [Idempotency](https://filterking.com/api/v1/documentation#idempotency) [Errors](https://filterking.com/api/v1/documentation#errors) [General Notes](https://filterking.com/api/v1/documentation#general-notes) [Data Sync Strategy](https://filterking.com/api/v1/documentation#data-sync-strategy) [Order Statuses](https://filterking.com/api/v1/documentation#order-statuses)

Endpoints

[POST\\
Issue access token](https://filterking.com/api/v1/documentation#oauth-token) [GET\\
Get partner info](https://filterking.com/api/v1/documentation#get-info) [GET\\
Get All Parent Models](https://filterking.com/api/v1/documentation#get-all-parent-models) [POST\\
Order quotes](https://filterking.com/api/v1/documentation#order-quotes) [POST\\
Create order](https://filterking.com/api/v1/documentation#create-order) [GET\\
List orders](https://filterking.com/api/v1/documentation#list-orders) [GET\\
Get order](https://filterking.com/api/v1/documentation#get-order) [GET\\
Get order tracking](https://filterking.com/api/v1/documentation#get-order-tracking) [POST\\
Build custom filter](https://filterking.com/api/v1/documentation#build-custom-filter)

Webhooks

[Overview](https://filterking.com/api/v1/documentation#webhooks-overview) [Configuration](https://filterking.com/api/v1/documentation#webhooks-configuration) [Events](https://filterking.com/api/v1/documentation#webhooks-events) [Signature Verification](https://filterking.com/api/v1/documentation#webhooks-signature) [Retry Logic](https://filterking.com/api/v1/documentation#webhooks-retries) [Best Practices](https://filterking.com/api/v1/documentation#webhooks-best-practices)

# Authentication

The Filter King API uses OAuth2 to authenticate requests. You can view and manage your API credentials
in your dashboard -> API Management.


Your API keys carry many privileges, so be sure to keep them secure! Do not share your secret API keys
in publicly accessible areas such as GitHub, client-side code, and so forth.


All API requests must be made over HTTPS. Calls made over plain HTTP will fail. API requests without
authentication will also fail.


### Authentication Flow

To authenticate, you'll need to obtain an access token using your client credentials. This token
should be included in the `Authorization`
header of your requests.


cURLPHPJavaScriptPythonOAuth2 Token Request

```bash

# Exchange client credentials for an access token
curl 'https://filterking.com/oauth/token' \
-H 'Content-Type: application/json' \
-d '{
  "grant_type": "client_credentials",
  "client_id": "your_client_id",
  "client_secret": "your_client_secret"
}'

```

```php
<?php
$client = new GuzzleHttp\Client();

$response = $client->post('https://filterking.com/oauth/token', [\
    'json' => [\
        'grant_type' => 'client_credentials',\
        'client_id' => 'your_client_id',\
        'client_secret' => 'your_client_secret'\
    ]\
]);

$token = json_decode($response->getBody(), true);
$accessToken = $token['access_token'];
```

```javascript
const response = await fetch('https://filterking.com/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    grant_type: 'client_credentials',
    client_id: 'your_client_id',
    client_secret: 'your_client_secret'
  })
});

const data = await response.json();
const accessToken = data.access_token;
```

```python
import requests

response = requests.post('https://filterking.com/oauth/token', json={
    'grant_type': 'client_credentials',
    'client_id': 'your_client_id',
    'client_secret': 'your_client_secret'
})

token = response.json()
access_token = token['access_token']
```

### Using Your Access Token

Include the bearer token in the `Authorization`
header when making API requests:


cURLPHPJavaScriptPythonAuthorized Request

```bash
curl https://filterking.com/api/v1/info \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

```php
<?php
$response = $client->get('https://filterking.com/api/v1/info', [\
    'headers' => [\
        'Authorization' => 'Bearer ' . $accessToken,\
    ]\
]);

$partner = json_decode($response->getBody(), true);
```

```javascript
const response = await fetch('https://filterking.com/api/v1/info', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const partner = await response.json();
```

```python
headers = {
    'Authorization': f'Bearer {access_token}'
}

response = requests.get(
    'https://filterking.com/api/v1/info',
    headers=headers
)

partner = response.json()
```

## Idempotency

To prevent duplicate orders caused by network retries or accidental double-submissions, the API supports
idempotency for POST requests. Specify a unique `Idempotency-Key`
header to ensure that a request is only executed once.


Subsequent requests with the same key will return the cached response from the original request,
preventing duplicate order creation. Keys are stored for 48 hours.


### Generating an Idempotency Key

We recommend using a **UUID v4** for your idempotency keys. UUIDs provide uniqueness
and are widely supported across programming languages.


cURLPHPJavaScriptPython

```bash
# Generate UUID v4 in Linux/macOS
UUID=$(cat /proc/sys/kernel/random/uuid 2>/dev/null || uuidgen)
echo $UUID

# Or using OpenSSL
openssl rand -hex 16 | sed 's/\(.\{8\}\)\(.\{4\}\)\(.\{4\}\)\(.\{4\}\)\(.\{12\}\)/\1-\2-\3-\4-\5/'
```

```php
<?php
// Generate UUID v4 in PHP
$idempotencyKey = sprintf(
    '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    mt_rand(0, 0xffff), mt_rand(0, 0xffff),
    mt_rand(0, 0xffff),
    mt_rand(0, 0x0fff) | 0x4000,
    mt_rand(0, 0x3fff) | 0x8000,
    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
);

// Or use Ramsey UUID (recommended)
// composer require ramsey/uuid
use Ramsey\Uuid\Uuid;
$idempotencyKey = Uuid::uuid4()->toString();
```

```javascript
// Generate UUID v4 in JavaScript (Node.js / Browser)
const idempotencyKey = crypto.randomUUID();

// Or use a simple fallback for older browsers
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
const idempotencyKey = generateUUID();
```

```python
import uuid

# Generate UUID v4 in Python
idempotency_key = str(uuid.uuid4())
```

### Usage Example

Include the generated key in your request headers:


Header Example

```json
Authorization: Bearer YOUR_ACCESS_TOKEN
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

## Errors

Filter King uses conventional HTTP response codes to indicate the success or failure of an API request.
In general:


- Codes in the **2xx** range indicate success.
- Codes in the **4xx** range indicate an error that failed given the information provided
(e.g., a required parameter was omitted, a resource was not found, etc.).

- Codes in the **5xx** range indicate an error with Filter King's servers.

### HTTP Status Code Summary

| Status Code | Description |
| --- | --- |
| 200 OK | Everything worked as expected. |
| 201 Created | The resource was successfully created. |
| 400 Bad Request | The request was unacceptable, often due to missing a required parameter. |
| 401 Unauthorized | No valid API key or access token provided. |
| 403 Forbidden | The API key doesn't have permissions to perform the request. |
| 404 Not Found | The requested resource doesn't exist. |
| 422 Unprocessable | The request was well-formed but contains semantic errors. |
| 429 Too Many Requests | Too many requests hit the API too quickly. |
| 500 Server Error | Something went wrong on Filter King's end. |

### Error Response Format

Errors are returned in JSON format with the following structure:

JSON Response

```json
{
  "success": false,
  "message": "The requested resource was not found.",
  "errors": [\
      {\
          "field": "order_id",\
          "message": "The selected order id is invalid."\
      }\
  ]
}
```

### Rate Limiting

To ensure fair usage and system stability, the API implements rate limiting on requests.


| Attribute | Limit |
| --- | --- |
| **Requests per minute** | 60 requests |

When you exceed the rate limit, the API returns a `429 Too Many Requests` status code.


**Recommendation:** Implement exponential backoff (retry with increasing delays) when encountering rate limit errors to handle temporary limits gracefully. If you need to extend rate limit please contact our support.


## General Notes

Important conventions and standards used throughout the API:

### Date & Time Format

All date and time fields are returned in **UTC** using the **ISO 8601** format
(`YYYY-MM-DDTHH:MM:SS.ffffffZ`).


**Example:**`2026-02-21T19:58:46.000000Z`

**Note:** Always parse dates as UTC. The `Z` suffix indicates UTC timezone.


## Data Sync Strategy

To ensure efficient data synchronization and optimal API performance, we recommend following the below guidelines when integrating with our API.


### Recommended Synchronization Approach

Use the appropriate endpoint based on your specific use case to minimize API calls and ensure data freshness.


#### Individual Order Endpoints

Use individual order endpoints when you need to retrieve or display real-time details for a specific order. These endpoints are designed for on-demand requests, such as:


- Loading order details on an order details page
- Displaying the latest tracking information for a single order
- Responding to user-initiated actions

`GET /api/v1/orders/{id}`

`GET /api/v1/orders/{id}/tracking`

#### Bulk Data Synchronization

For maintaining up-to-date order data across your system, use the list endpoint with the `updated_after` parameter. This approach is recommended for:


- Periodic background synchronization
- Batch updates of multiple orders
- Tracking status updates across your order database

`GET /api/v1/orders?updated_after=2026-02-21T19:58:46.000000Z`

### Implementation Guidelines

#### Recommended Polling Interval

We recommend calling the bulk synchronization endpoint every **15 minutes**. This interval balances data freshness with API resource efficiency.


#### Tracking Last Sync Timestamp

Maintain the timestamp of your last successful sync and use it as the `updated_after` parameter value in subsequent requests. This ensures you only receive orders that have been updated since your last sync.


#### Error Handling

Implement exponential backoff when encountering rate limits or temporary errors. If the sync fails, retry with increasing delays (e.g., 1 minute, 5 minutes, 15 minutes) before reverting to the normal 15-minute interval.


**Benefit:** Following this strategy reduces unnecessary API calls, ensures you receive only relevant updated data, and helps maintain optimal system performance for both your application and our API.


### Example Implementation Flow

cURLPHPJavaScriptPython

```bash
# Store last sync timestamp (example)
LAST_SYNC="2026-02-21T19:58:46.000000Z"

# Poll every 15 minutes for updated orders
curl "https://filterking.com/api/v1/orders?updated_after=${LAST_SYNC}&per_page=100" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

```php
<?php
// Store and retrieve last sync timestamp from your database/config
$lastSyncTimestamp = getLastSyncTimestamp(); // e.g., "2026-02-21T19:58:46.000000Z"

// Poll for updated orders (run every 15 minutes via cron/job scheduler)
$response = $client->get('https://filterking.com/api/v1/orders', [\
    'headers' => [\
        'Authorization' => 'Bearer ' . $accessToken,\
    ],\
    'query' => [\
        'updated_after' => $lastSyncTimestamp,\
        'per_page' => 100\
    ]\
]);

$orders = json_decode($response->getBody(), true);

// Process orders and update last sync timestamp
if ($orders['success']) {
    foreach ($orders['data']['orders'] as $order) {
        // Sync order data to your database
        syncOrderToDatabase($order);
    }

    // Update last sync timestamp to current time
    updateLastSyncTimestamp(date('c'));
}
```

```javascript
// Store last sync timestamp
let lastSyncTimestamp = '2026-02-21T19:58:46.000000Z';

// Function to sync updated orders (run every 15 minutes)
async function syncOrders() {
  const response = await fetch(
    `https://filterking.com/api/v1/orders?updated_after=${lastSyncTimestamp}&per_page=100`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  const data = await response.json();

  if (data.success) {
    // Process each updated order
    for (const order of data.data.orders) {
      await syncOrderToDatabase(order);
    }

    // Update last sync timestamp to current time
    lastSyncTimestamp = new Date().toISOString();
  }
}

// Run every 15 minutes
setInterval(syncOrders, 15 * 60 * 1000);
```

```python
import requests
from datetime import datetime
import time

# Store last sync timestamp
last_sync_timestamp = '2026-02-21T19:58:46.000000Z'

def sync_orders():
    global last_sync_timestamp

    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    params = {
        'updated_after': last_sync_timestamp,
        'per_page': 100
    }

    response = requests.get(
        'https://filterking.com/api/v1/orders',
        headers=headers,
        params=params
    )

    data = response.json()

    if data['success']:
        for order in data['data']['orders']:
            # Sync order to your database
            sync_order_to_database(order)

        # Update last sync timestamp
        last_sync_timestamp = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%fZ')

# Run every 15 minutes
while True:
    sync_orders()
    time.sleep(15 * 60)  # 15 minutes
```

## Order Statuses

The following order statuses are used throughout the API to indicate the current state of an order.


### Status List

| Status | Description |
| --- | --- |
| `paid` | Order has been paid and is ready for processing |
| `unfulfilled` | Order has started processing |
| `partially shipped` | Some items in the order have been shipped, but not all |
| `fulfilled` | All order items have been shipped and processing is complete |
| `ready for pick up` | Order is ready for customer pick up (for customer\_pick\_up shipping method) |
| `refunded` | Order has been fully or partially refunded |
| `cancelled` | Order has been cancelled |
| `cancelled and refunded` | Order was cancelled and a refund was issued |
| `returned and refunded` | Order items were returned and a refund was issued |
| `error` | Order processing encountered an error |

## POST  Issue an access token

Exchange client credentials for an OAuth2 access token.

`POST /oauth/token`

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `grant_type` | `string` | Must be `"client_credentials"` |
| `client_id` | `string` | Your OAuth client ID |
| `client_secret` | `string` | Your OAuth client secret |

### Response

JSON

```json
{
  "token_type": "Bearer",
  "expires_in": 3600,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}
```

**Token Validity:** The access token is valid for **1 hour** (3600 seconds).
After expiration, you need to request a new token using the same endpoint.


## GET  Get partner information

Retrieve information about the authenticated partner account.

`GET /api/v1/info`

cURLPHPJavaScriptPython

```bash
curl https://filterking.com/api/v1/info \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

```php
<?php
$response = $client->get('https://filterking.com/api/v1/info', [\
    'headers' => [\
        'Authorization' => 'Bearer ' . $accessToken,\
    ]\
]);
$partner = json_decode($response->getBody(), true);
```

```javascript
const response = await fetch('https://filterking.com/api/v1/info', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
const partner = await response.json();
```

```python
headers = {
    'Authorization': f'Bearer {access_token}'
}

response = requests.get(
    'https://filterking.com/api/v1/info',
    headers=headers
)

partner = response.json()
```

### Response

JSON • 200 OK

```json
{
    "success": true,
    "data": {
        "app_name": "FK API",
        "environment": "production",
        "client_id": "your_client_id",
        "partner_name": "Filter King Partner",
        "partner_email": "partner@example.com",
        "partner_phone": "123-456-7890",
        "api_status": "active"
    }
}
```

## GET  Get All Parent Models

Retrieve full list of available stock inventory SKUs

`GET /api/v1/get-all-parent-models`

cURLPHPJavaScriptPython

```bash
curl https://filterking.com/api/v1/get-all-parent-models \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

```php
<?php
$response = $client->get('https://filterking.com/api/v1/get-all-parent-models', [\
    'headers' => [\
        'Authorization' => 'Bearer ' . $accessToken,\
    ]\
]);
$partner = json_decode($response->getBody(), true);
```

```javascript
const response = await fetch('https://filterking.com/api/v1/get-all-parent-models', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
const partner = await response.json();
```

```python
headers = {
    'Authorization': f'Bearer {access_token}'
}

response = requests.get(
    'https://filterking.com/api/v1/get-all-parent-models',
    headers=headers
)

partner = response.json()
```

### Response

JSON • 200 OK

```json
{
    "success": true,
    "data": {
        "sku_items": [\
            {\
                "parent_model": "AF10x10x1-M13",\
                "size": "10x10x1",\
                "actual_size": "9.5 x 9.5 x .75",\
                "merv": "MERV 13",\
                "thickness": "1-Inch Filter",\
                "unit_price": 7.3\
            },\
            {\
                "parent_model": "AF10x10x1-M11",\
                "size": "10x10x1",\
                "actual_size": "9.5 x 9.5 x .75",\
                "merv": "MERV 11",\
                "thickness": "1-Inch Filter",\
                "unit_price": 7.12\
            },\
            .\
            .\
            .\
            {\
                "parent_model": "AF20X20X5-HW-CO",\
                "size": "20x20x5",\
                "actual_size": "19.68 x 19.93 x 4.37",\
                "merv": "CARBON",\
                "thickness": "5-Inch Filter",\
                "unit_price": 20.37\
            }\
        ],
        "total": 315
    }
}
```

## POST  Get order quotes

Get order quotes including estimated shipping costs and Sales Tax.


Note: Actual shipping costs may vary at the time of shipment. A `ship_to` address is required to calculate shipping cost and sales tax. For `customer_pick_up`, pass your company address as the `ship_to` parameter. If your company has an approved tax-exempt document on file, no sales tax will be calculated.


`POST /api/v1/order/quotes`

cURLPHPJavaScriptPython

```bash
curl https://filterking.com/api/v1/order/quotes  \
  -X POST \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: your-unique-key-here" \
  -d '{
    "shipping_method": "fedex",
    "ship_to": {
        "address_line_1": "123 Main St",
        "address_line_2": "Apt 123",
        "city": "Anytown",
        "state": "NY",
        "zip": "12345",
        "country": "US"
    },
    "items": [\
        {\
            "parent_model": "AF12x12x1-M8",\
            "quantity": 4\
        },\
        {\
            "parent_model": "AF10x10x1A-M8",\
            "quantity": 10\
        }\
    ]
}'
```

```php
<?php
$client = new GuzzleHttp\Client();

$response = $client->post('https://filterking.com/api/v1/order/quotes', [\
    'headers' => [\
        'Authorization' => 'Bearer ' . $accessToken,\
        'Idempotency-Key' => 'your-unique-key-here',\
    ],\
    'json' => [\
      'shipping_method': 'fedex',\
      'ship_to' => [\
        "address_line_1": "123 Main St",\
        "address_line_2": "Apt 123",\
        "city": "Anytown",\
        "state": "NY",\
        "zip": "12345",\
        "country": "US"\
      ],\
      'items': [\
        {\
          'parent_model': 'AF12x12x1-M8',\
          'quantity': 4\
        },\
        {\
          'parent_model': 'AF10x10x1A-M8',\
          'quantity': 10\
        }\
      ]\
    ]\
]);

$quotes = json_decode($response->getBody(), true);
```

```javascript
const response = await fetch('https://filterking.com/api/v1/order/quotes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Idempotency-Key': 'your-unique-key-here',
  },
  body: JSON.stringify({
    'shipping_method': 'fedex',
    'ship_to': {
      "address_line_1": "123 Main St",
        "address_line_2": "Apt 123",
        "city": "Anytown",
        "state": "NY",
        "zip": "12345",
        "country": "US"
    },
    'items': [\
      {\
        'parent_model': 'AF12x12x1-M8',\
        'quantity': 4\
      },\
      {\
        'parent_model': 'AF10x10x1A-M8',\
        'quantity': 10\
      }\
    ]
  })
});

const quotes = await response.json();
```

```python
headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json',
    'Idempotency-Key': 'your-unique-key-here'
}

data = {
    'shipping_method': 'fedex',
    'ship_to': {
      "address_line_1": "123 Main St",
        "address_line_2": "Apt 123",
        "city": "Anytown",
        "state": "NY",
        "zip": "12345",
        "country": "US"
    },
    'items': [\
      {\
        'parent_model': 'AF12x12x1-M8',\
        'quantity': 4\
      },\
      {\
        'parent_model': 'AF10x10x1A-M8',\
        'quantity': 10\
      }\
    ]
}

response = requests.post(
    'https://filterking.com/api/v1/order/quotes',
    headers=headers,
    json=data
)

quotes = response.json()
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `shipping_method` | `string` | Shipping carrier method: `fedex` or `customer_pick_up`. If `customer_pick_up` is passed, `estimated_shipping_cost` will be `0`. |
| `ship_to` | `object` | Shipping destination address (required)


Note: Please pass your company address if you choose shipping\_method as `customer_pick_up`

| ship\_to Attributes |
| --- |
| Attribute | Type | Description |
| --- | --- | --- |
| `address_line_1` | `string` | Street address (required) |
| `address_line_2` | `string` | Apartment, suite, unit, etc. (Optional) |
| `city` | `string` | City name (required, max: 100 characters) |
| `state` | `string` | State code (required, 2-letter ISO code, e.g., NY, FL) |
| `zip` | `string` | ZIP/postal code (required) |
| `country` | `string` | Country code (required, 2-letter ISO code, e.g., US) | |
| `items` | `array` | Array of filter items

| items\[\] Attributes |
| --- |
| Attribute | Type | Description |
| --- | --- | --- |
| `parent_model` | `string` | Filter parent model in format: AF{width}x{height}x{thickness}-{merv} (e.g., AF12x12x1-M8) |
| `quantity` | `integer` | Number of units (minimum: 1) | |

**Accepted MERV ratings:**`M8` (MERV 8), `M11` (MERV 11), `M13` (MERV 13), `CO` (Carbon)


**Thickness:** Only `0.5`, `1`, `2`, or `4` inches are accepted.


**Width and height measurements** must use standard fractional increments. Accepted decimal values: `.125` (1/8"), `.25` (1/4"), `.375` (3/8"), `.5` (1/2"), `.625` (5/8"), `.75` (3/4"), or `.875` (7/8").


**Example:**`AF12.125x12.75x1-M8`

**For actual size filters**, append `A` after thickness (e.g., `AF12.125x12.75x1A-M8`).


### Filter Size Quick Reference

Common filter sizes and their corresponding parent model format:

| Filter Size | Parent Model (MERV 8) | Parent Model (MERV 11) |
| --- | --- | --- |
| `20x20x1` | `AF20x20x1-M8` | `AF20x20x1-M11` |
| `16x25x1` | `AF16x25x1-M8` | `AF16x25x1-M11` |
| `14x25x2` | `AF14x25x2-M8` | `AF14x25x2-M11` |
| `12x12x1` | `AF12x12x1-M8` | `AF12x12x1-M11` |
| `18.25x23.5x1` | `AF18.25x23.5x1-M8` | `AF18.25x23.5x1-M11` |
| `15.375x24.875x1` | `AF15.375x24.875x1-M8` | `AF15.375x24.875x1-M11` |
| `14.25x20x1` | `AF14.25x20x1-M8` | `AF14.25x20x1-M11` |
| `12.125x12.75x1a`(actual size) | `AF12.125x12.75x1A-M8` | `AF12.125x12.75x1A-M11` |
| `11.625x14.5x2a`(actual size) | `AF11.625x14.5x2A-M8` | `AF11.625x14.5x2A-M11` |
| `10x10x4` | `AF10x10x4-M8` | `AF10x10x4-M11` |

### Response

JSON • 200 OK

```json
{
    "success": true,
    "data": {
        "shipping_method": "fedex",
        "ship_to": {
            "address_line_1": "123 Main St",
            "address_line_2": "Apt 123",
            "city": "Anytown",
            "state": "NY",
            "zip": "12345",
            "country": "US"
        },
        "items": [\
            {\
                "parent_model": "AF12x12x1-M8",\
                "size": "12x12x1",\
                "actual_size": "11.5 x 11.5 x .75",\
                "quantity": 4,\
                "unit_price": 5.98,\
                "item_price": 23.92\
            },\
            {\
                "parent_model": "AF10x10x1A-M8",\
                "size": "10x10x1a",\
                "actual_size": "10 x 10 x .75",\
                "quantity": 10,\
                "unit_price": 8.58,\
                "item_price": 85.8\
            }\
        ],
        "total": {
            "subtotal": 109.72,
            "estimated_shipping_cost": 23.77,
            "tax": {
                "amount": 9.19,
                "rate": 8.4,
                "rate_type": "percent",
                "jurisdiction": "NV"
            },
            "amount": 97.38,
            "currency": "USD"
        }
    }
}
```

## POST  Create order

Create a new order in the system.


Note: A ship\_to address is required to calculate shipping cost and sales tax. For customer\_pick\_up, pass your company address as the ship\_to parameter. If your company has an approved tax-exempt document on file, no sales tax will be calculated.


`POST /api/v1/orders`

cURLPHPJavaScriptPython

```bash
curl https://filterking.com/api/v1/orders \
  -X POST \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: your-unique-key-here" \
  -d '{
    "test_order": false,
    "po_number": "ABC3015",
    "ship_to": {
        "name": "Test Name",
        "company": "Test company name",
        "phone": "1234567890",
        "address_line_1": "123 Main St",
        "address_line_2": "Apt 123",
        "city": "Anytown",
        "state": "NY",
        "zip": "12345",
        "country": "US"
    },
    "ship_from": {
        "name": "Filter King",
        "company": "Filter King LLC",
        "phone": "305-928-8910",
        "address_line_1": "7301 NW 36th Ct",
        "city": "Miami",
        "state": "FL",
        "zip": "33147",
        "country": "US"
    },
    "shipping_method": "fedex",
    "items": [\
        {\
            "parent_model": "AF10x10x1-M8",\
            "quantity": 40\
        },\
        {\
            "parent_model": "AF11.625x14.5x1A-M11",\
            "quantity": 10\
        }\
    ]
}'
```

```php
<?php
$response = $client->post('https://filterking.com/api/v1/orders', [\
    "headers" => [\
        "Authorization" => "Bearer " . $accessToken,\
        "Idempotency-Key" => "your-unique-key-here",\
    ],\
    "json" => [\
        "test_order": false,\
        "po_number": "ABC3015",\
        "ship_to": {\
            "name": "Test Name",\
            "company": "Test company name",\
            "phone": "2152343245",\
            "address_line_1": "12300 Bermuda Rd",\
            "city": "Henderson",\
            "state": "NV",\
            "zip": "89044",\
            "country": "US"\
        },\
        "ship_from": {\
            "name": "Filter King",\
            "company": "Filter King LLC",\
            "phone": "305-928-8910",\
            "address_line_1": "7301 NW 36th Ct",\
            "city": "Miami",\
            "state": "FL",\
            "zip": "33147",\
            "country": "US"\
        },\
        "shipping_method": "fedex",\
        "items": [\
            {\
                "parent_model": "AF10x10x1-M8",\
                "quantity": 40\
            },\
            {\
                "parent_model": "AF11.625x14.5x1A-M11",\
                "quantity": 10\
            }\
        ]\
    ]\
]);

$order = json_decode($response->getBody(), true);
```

```javascript
const response = await fetch('https://filterking.com/api/v1/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Idempotency-Key': 'your-unique-key-here',
  },
  body: JSON.stringify({
    "test_order": false,
    "po_number": "ABC3015",
    "ship_to": {
      "name": "Test Name",
      "company": "Test company name",
      "phone": "2152343245",
      "address_line_1": "12300 Bermuda Rd",
      "city": "Henderson",
      "state": "NV",
      "zip": "89044",
      "country": "US"
    },
    "ship_from": {
      "name": "Filter King",
      "company": "Filter King LLC",
      "phone": "305-928-8910",
      "address_line_1": "7301 NW 36th Ct",
      "city": "Miami",
      "state": "FL",
      "zip": "33147",
      "country": "US"
    },
    "shipping_method": "fedex",
    "items": [\
      {\
        "parent_model": "AF10x10x1-M8",\
        "quantity": 40\
      },\
      {\
        "parent_model": "AF11.625x14.5x1A-M11",\
        "quantity": 10\
      }\
    ]
  })
});

const order = await response.json();
```

```python
headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json',
    'Idempotency-Key': 'your-unique-key-here'
}

data = {
    "test_order": False,
    "po_number": "ABC3015",
    "ship_to": {
      "name": "Test Name",
      "company": "Test company name",
      "phone": "2152343245",
      "address_line_1": "12300 Bermuda Rd",
      "city": "Henderson",
      "state": "NV",
      "zip": "89044",
      "country": "US"
    },
    "ship_from": {
      "name": "Filter King",
      "company": "Filter King LLC",
      "phone": "305-928-8910",
      "address_line_1": "7301 NW 36th Ct",
      "city": "Miami",
      "state": "FL",
      "zip": "33147",
      "country": "US"
    },
    "shipping_method": "fedex",
    "items": [\
      {\
        "parent_model": "AF10x10x1-M8",\
        "quantity": 40\
      },\
      {\
        "parent_model": "AF11.625x14.5x1A-M11",\
        "quantity": 10\
      }\
    ]
}

response = requests.post(
    'https://filterking.com/api/v1/orders',
    headers=headers,
    json=data
)

order = response.json()
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `test_order` | `boolean` | Set to `false` for production orders. Set to `true` for test orders, which will be automatically `cancelled` after the order created. (required, default: `false`) |
| `po_number` | `string` | Purchase order number (optional, max: 30 characters. If not provided, default will be set as `order_id`) |
| `ship_to` | `object` | Shipping destination address (required)


Note: Please pass your company address if you choose shipping\_method as `customer_pick_up`

| ship\_to Attributes |
| --- |
| Attribute | Type | Description |
| --- | --- | --- |
| `name` | `string` | Recipient name (max: 100 characters) |
| `company` | `string` | Company name (max: 100 characters) |
| `phone` | `string` | Phone number (US format) |
| `address_line_1` | `string` | Street address (required) |
| `address_line_2` | `string` | Apartment, suite, unit, etc. (Optional) |
| `city` | `string` | City name (required, max: 100 characters) |
| `state` | `string` | State code (required, 2-letter ISO code, e.g., NY, FL) |
| `zip` | `string` | ZIP/postal code (required) |
| `country` | `string` | Country code (required, 2-letter ISO code, e.g., US) |
| `note` | `string` | Delivery instructions for the driver if any. (optional) | |
| `ship_from` | `object` | Shipping origin address (optional, default is FilterKing).

| ship\_from Attributes |
| --- |
| Attribute | Type | Description |
| --- | --- | --- |
| `name` | `string` | Sender name (max: 100 characters) |
| `company` | `string` | Company name (max: 100 characters) |
| `phone` | `string` | Phone number (US format) |
| `address_line_1` | `string` | Street address (required if provided) |
| `address_line_2` | `string` | Apartment, suite, unit, etc. |
| `city` | `string` | City name (required if provided) |
| `state` | `string` | State code (required if provided, 2-letter ISO code, e.g., NY, FL) |
| `zip` | `string` | ZIP/postal code (required if provided) |
| `country` | `string` | Country code (required if provided, 2-letter ISO code, e.g., US) | |
| `shipping_method` | `string` | Shipping carrier method: `fedex` or `customer_pick_up` |
| `items` | `array` | Array of filter items (required, min: 1, max: 100)

| items\[\] Attributes |
| --- |
| Attribute | Type | Description |
| --- | --- | --- |
| `parent_model` | `string` | Filter parent model in format: AF{width}x{height}x{thickness}-{merv} (e.g., AF12x12x1-M8) |
| `quantity` | `integer` | Number of units (minimum: 1) | |

**Test Orders:** Use `test_order: false` for testing. These orders will be automatically cancelled after creation. Use `test_order: true` for production orders.


**Accepted MERV ratings:**`M8` (MERV 8), `M11` (MERV 11), `M13` (MERV 13), `CO` (Carbon)


**Thickness:** Only `0.5`, `1`, `2`, or `4` inches are accepted.


**Width and height measurements** must use standard fractional increments. Accepted decimal values: `.125` (1/8"), `.25` (1/4"), `.375` (3/8"), `.5` (1/2"), `.625` (5/8"), `.75` (3/4"), or `.875` (7/8").


**Example:**`AF12.125x12.75x1-M8`

**For actual size filters**, append `A` after thickness (e.g., `AF12.125x12.75x1A-M8`).


### Response

JSON • 201 Created

```json
{
    "success": true,
    "data": {
        "order": {
            "order_id": 12345678,
            "po_number": "ABC3015",
            "type": "wholesale",
            "status": "pending",
            "created_at": "2026-02-21T19:58:46.000000Z",
            "items": [\
                {\
                    "parent_model": "AF10x10x1-M8",\
                    "size": "10x10x1",\
                    "actual_size": "9.5 x 9.5 x .75",\
                    "quantity": 40,\
                    "unit_price": 2.84,\
                    "item_price": 113.6\
                },\
                {\
                    "parent_model": "AF11.625x14.5x1A-M11",\
                    "size": "11.625x14.5x1a",\
                    "actual_size": "11.625 x 14.5 x 0.75",\
                    "quantity": 10,\
                    "unit_price": 8.7,\
                    "item_price": 87\
                }\
            ],
            "total": {
                "subtotal": 200.6,
                "shipping_cost": 12.66,
                "tax": {
                    "amount": 17.86,
                    "rate": 8.4,
                    "rate_type": "percent",
                    "jurisdiction": "NV"
                },
                "amount": 231.12,
                "currency": "USD"
            }
        }
    },
    "message": "Order created successfully"
}
```

## GET  List orders

Retrieve a paginated list of orders with optional filters.

`GET /api/v1/orders`

### Request Examples

cURLPHPJavaScriptPython

```bash
# Basic request - get all orders from last 24 hours
curl "https://filterking.com/api/v1/orders" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With pagination and filters
curl "https://filterking.com/api/v1/orders?page=1&per_page=50&status=fulfilled" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get orders created after a specific date
curl "https://filterking.com/api/v1/orders?created_after=2026-02-21T19:58:46.000000Z" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With sorting
curl "https://filterking.com/api/v1/orders?sort_by=created_at&sort_direction=desc" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

```php
<?php
// Basic request
$response = $client->get('https://filterking.com/api/v1/orders', [\
    'headers' => [\
        'Authorization' => 'Bearer ' . $accessToken,\
    ]\
]);

// With query parameters
$response = $client->get('https://filterking.com/api/v1/orders', [\
    'headers' => [\
        'Authorization' => 'Bearer ' . $accessToken,\
    ],\
    'query' => [\
        'page' => 1,\
        'per_page' => 50,\
        'status' => 'fulfilled',\
        'created_after' => '2026-02-21T19:58:46.000000Z',\
        'sort_by' => 'created_at',\
        'sort_direction' => 'desc'\
    ]\
]);

$orders = json_decode($response->getBody(), true);
```

```javascript
// Basic request
const response = await fetch('https://filterking.com/api/v1/orders', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// With query parameters
const params = new URLSearchParams({
  page: 1,
  per_page: 50,
  status: 'fulfilled',
  created_after: '2026-02-21T19:58:46.000000Z',
  sort_by: 'created_at',
  sort_direction: 'desc'
});

const response = await fetch(
  `https://filterking.com/api/v1/orders?${params}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
);

const orders = await response.json();
```

```python
headers = {
    'Authorization': f'Bearer {access_token}'
}

# Basic request
response = requests.get(
    'https://filterking.com/api/v1/orders',
    headers=headers
)

# With query parameters
params = {
    'page': 1,
    'per_page': 50,
    'status': 'fulfilled',
    'created_after': '2026-02-21T19:58:46.000000Z',
    'sort_by': 'created_at',
    'sort_direction': 'desc'
}

response = requests.get(
    'https://filterking.com/api/v1/orders',
    headers=headers,
    params=params
)

orders = response.json()
```

### Query Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `page` | `integer` | Page number for pagination (default: 1, minimum: 1) |
| `per_page` | `integer` | Number of items per page (default: 15, min: 1, max: 100) |
| `status` | `string` | Filter by order status (e.g., pending, unfulfilled, fulfilled, cancelled) |
| `po_number` | `string` | Filter by purchase order number (exact match, max: 30 characters) |
| `created_after` | `string` | Filter orders created after this ISO 8601 date (UTC). If not provided, defaults to last 24 hours. |
| `updated_after` | `string` | Filter orders updated after this ISO 8601 date (UTC). |
| `sort_by` | `string` | Field to sort by (default: created\_at, options: created\_at, updated\_at, amount, id) |
| `sort_direction` | `string` | Sort direction (default: desc, options: asc, desc) |

**Default Behavior:** If no date filters (`created_after` or `updated_after`) are provided, the API returns orders from the last 24 hours. Use these parameters to retrieve older orders.


### Response

JSON • 200 OK

```json
{
    "success": true,
    "data": {
        "orders": [\
            {\
                "order_id": 12345678,\
                "po_number": "ABC3015",\
                "type": "wholesale",\
                "status": "fulfilled",\
                "payment_status": "paid",\
                "ship_to": {\
                    "name": "Test Name",\
                    "company": "Test company name",\
                    "phone": "1234567890",\
                    "address_line_1": "123 Main St",\
                    "address_line_2": "Apt 123",\
                    "city": "Anytown",\
                    "state": "NY",\
                    "zip": "12345",\
                    "country": "US"\
                },\
                "ship_from": {\
                    "name": "FILTER KING",\
                    "company": "FILTER KING LLC",\
                    "phone": "877-570-9755",\
                    "address_line_1": "7301 NW 36TH COURT",\
                    "address_line_2": null,\
                    "city": "MIAMI",\
                    "state": "FL",\
                    "zip": "33147",\
                    "country": "US"\
                },\
                "shipping_method": "fedex",\
                "customer": {\
                    "name": "Test Customer Name",\
                    "email": "customer@example.com",\
                    "phone": "123-456-7890"\
                },\
                "items": [\
                    {\
                        "parent_model": "AF20x20x1-M8",\
                        "size": "20x20x1",\
                        "actual_size": "19.5 x 19.5 x .75",\
                        "quantity": 35,\
                        "unit_price": 9.42,\
                        "item_price": 329.7\
                    }\
                ],\
                "shipments": [\
                    {\
                        "carrier": "fedex",\
                        "service_type": "FEDEX_GROUND",\
                        "tracking_number": "fedex_tracking_number",\
                        "label_created_at": "2026-06-05T16:18:08.000000Z",\
                        "estimated_delivery_date": "2026-06-08T15:14:53.000000Z",\
                        "delivered_at": "2026-06-08T15:14:53.000000Z",\
                        "tracking_status": {\
                            "derived_status": "Delivered",\
                            "derived_status_code": "DL",\
                            "event_type": "DL",\
                            "event_description": "Delivered",\
                            "city": "delivered_city",\
                            "state": "delivered_state",\
                            "date": "2026-06-08T15:14:53.000000Z"\
                        },\
                        "shipment_contents": [\
                            {\
                                "parent_model": "AF20X30X1A-M13",\
                                "quantity": 4\
                            }\
                        ]\
                    },\
                    {\
                        "carrier": "fedex",\
                        "service_type": "FEDEX_GROUND",\
                        "tracking_number": "fedex_tracking_number",\
                        "label_created_at": "2026-06-05T14:27:32.000000Z",\
                        "estimated_delivery_date": "2026-06-08T15:14:53.000000Z",\
                        "delivered_at": "2026-06-08T15:14:53.000000Z",\
                        "tracking_status": {\
                            "derived_status": "Delivered",\
                            "derived_status_code": "DL",\
                            "event_type": "DL",\
                            "event_description": "Delivered",\
                            "city": "delivered_city",\
                            "state": "delivered_state",\
                            "date": "2026-06-08T15:14:53.000000Z"\
                        },\
                        "shipment_contents": [\
                            {\
                                "parent_model": "AF14X14X1A-M13",\
                                "quantity": 4\
                            }\
                        ]\
                    }\
                ],\
                "total": {\
                    "subtotal": 200.6,\
                    "shipping_cost": 12.66,\
                    "tax": {\
                        "amount": 17.86,\
                        "rate": 8.4,\
                        "rate_type": "percent",\
                        "jurisdiction": "NV"\
                    },\
                    "amount": 231.12,\
                    "currency": "USD"\
                },\
                "fulfilled_at": "2026-02-21T19:58:46.000000Z",\
                "created_at": "2026-02-21T19:58:46.000000Z",\
                "updated_at": "2026-02-21T19:58:46.000000Z"\
            }\
        ],
        "meta": {
            "current_page": 1,
            "per_page": 15,
            "total": 42,
            "last_page": 3,
            "from": 1,
            "to": 15
        },
        "links": {
            "first": "https://filterking.com/api/v1/orders?page=1",
            "last": "https://filterking.com/api/v1/orders?page=3",
            "prev": null,
            "next": "https://filterking.com/api/v1/orders?page=2"
        }
    }
}
```

## GET  Get order

Retrieve details of a specific order.

`GET /api/v1/orders/{id}`

### URL Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | `string` | The order ID |

### Request

cURLPHPJavaScriptPython

```bash
curl https://filterking.com/api/v1/orders/12345678 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

```php
<?php
$response = $client->get('https://filterking.com/api/v1/orders/12345678', [\
    'headers' => [\
        'Authorization' => 'Bearer ' . $accessToken,\
    ]\
]);

$order = json_decode($response->getBody(), true);
```

```javascript
const response = await fetch('https://filterking.com/api/v1/orders/12345678', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const order = await response.json();
```

```python
headers = {
    'Authorization': f'Bearer {access_token}'
}

response = requests.get(
    'https://filterking.com/api/v1/orders/12345678',
    headers=headers
)

order = response.json()
```

### Response

JSON • 200 OK

```json
{
    "success": true,
    "data": {
        "order": {
            "order_id": 12345678,
            "po_number": "ABC3015",
            "type": "wholesale",
            "status": "fulfilled",
            "payment_status": "paid",
            "ship_to": {
                "name": "Test Name",
                "company": "Test company name",
                "phone": "1234567890",
                "address_line_1": "123 Main St",
                "address_line_2": "Apt 123",
                "city": "Anytown",
                "state": "NY",
                "zip": "12345",
                "country": "US"
            },
            "ship_from": {
                "name": "FILTER KING",
                "company": "FILTER KING LLC",
                "phone": "877-570-9755",
                "address_line_1": "7301 NW 36TH COURT",
                "address_line_2": null,
                "city": "MIAMI",
                "state": "FL",
                "zip": "33147",
                "country": "US"
            },
            "shipping_method": "fedex",
            "customer": {
                "name": "Test Customer Name",
                "email": "customer@example.com",
                "phone": "123-456-7890"
            },
            "items": [\
                {\
                    "parent_model": "AF20x20x1-M8",\
                    "size": "20x20x1",\
                    "actual_size": "19.5 x 19.5 x .75",\
                    "quantity": 35,\
                    "unit_price": 9.42,\
                    "item_price": 329.7\
                }\
            ],
            "shipments": [\
                {\
                    "carrier": "fedex",\
                    "service_type": "FEDEX_GROUND",\
                    "tracking_number": "fedex_tracking_number",\
                    "label_created_at": "2026-06-05T16:18:08.000000Z",\
                    "estimated_delivery_date": "2026-06-08T15:14:53.000000Z",\
                    "delivered_at": "2026-06-08T15:14:53.000000Z",\
                    "tracking_status": {\
                        "derived_status": "Delivered",\
                        "derived_status_code": "DL",\
                        "event_type": "DL",\
                        "event_description": "Delivered",\
                        "city": "delivered_city",\
                        "state": "delivered_state",\
                        "date": "2026-06-08T15:14:53.000000Z"\
                    },\
                    "shipment_contents": [\
                        {\
                            "parent_model": "AF20X30X1A-M13",\
                            "quantity": 4\
                        }\
                    ]\
                },\
                {\
                    "carrier": "fedex",\
                    "service_type": "FEDEX_GROUND",\
                    "tracking_number": "fedex_tracking_number",\
                    "label_created_at": "2026-06-05T14:27:32.000000Z",\
                    "estimated_delivery_date": "2026-06-08T15:14:53.000000Z",\
                    "delivered_at": "2026-06-08T15:14:53.000000Z",\
                    "tracking_status": {\
                        "derived_status": "Delivered",\
                        "derived_status_code": "DL",\
                        "event_type": "DL",\
                        "event_description": "Delivered",\
                        "city": "delivered_city",\
                        "state": "delivered_state",\
                        "date": "2026-06-08T15:14:53.000000Z"\
                    },\
                    "shipment_contents": [\
                        {\
                            "parent_model": "AF14X14X1A-M13",\
                            "quantity": 4\
                        }\
                    ]\
                }\
            ],
            "total": {
                "subtotal": 200.6,
                "shipping_cost": 12.66,
                "tax": {
                    "amount": 17.86,
                    "rate": 8.4,
                    "rate_type": "percent",
                    "jurisdiction": "NV"
                },
                "amount": 231.12,
                "currency": "USD"
            },
            "fulfilled_at": "2026-02-21T19:58:46.000000Z",
            "created_at": "2026-02-21T19:58:46.000000Z",
            "updated_at": "2026-02-21T19:58:46.000000Z",
        }
    }
}
```

## GET  Get order tracking

Retrieve details of a specific order shipment tracking.

`GET /api/v1/orders/{id}/tracking`

### URL Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | `string` | The order ID eg. 12345678 |

### Request

cURLPHPJavaScriptPython

```bash
curl https://filterking.com/api/v1/orders/12345678/tracking \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

```php
<?php
$response = $client->get('https://filterking.com/api/v1/orders/12345678/tracking', [\
    'headers' => [\
        'Authorization' => 'Bearer ' . $accessToken,\
    ]\
]);

$order = json_decode($response->getBody(), true);
```

```javascript
const response = await fetch('https://filterking.com/api/v1/orders/12345678/tracking', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const order = await response.json();
```

```python
headers = {
    'Authorization': f'Bearer {access_token}'
}

response = requests.get(
    'https://filterking.com/api/v1/orders/12345678/tracking',
    headers=headers
)

order = response.json()
```

### Response

JSON • 200 OK

```json
{
    "success": true,
    "data": {
        "order": {
            "order_id": 12345678,
            "type": "wholesale",
            "status": "fulfilled",
            "customer": {
                "name": "Test Customer Name",
                "email": "customer@example.com",
                "phone": "123-456-7890"
            },
            "shipments": [\
                {\
                    "carrier": "fedex",\
                    "service_type": "FEDEX_GROUND",\
                    "tracking_number": "fedex_tracking_number",\
                    "label_created_at": "2026-06-05T16:18:08.000000Z",\
                    "estimated_delivery_date": "2026-06-08T15:14:53.000000Z",\
                    "delivered_at": "2026-06-08T15:14:53.000000Z",\
                    "tracking_status": {\
                        "derived_status": "Delivered",\
                        "derived_status_code": "DL",\
                        "event_type": "DL",\
                        "event_description": "Delivered",\
                        "city": "delivered_city",\
                        "state": "delivered_state",\
                        "date": "2026-06-08T15:14:53.000000Z"\
                    },\
                    "shipment_contents": [\
                        {\
                            "parent_model": "AF20X30X1A-M13",\
                            "quantity": 4\
                        }\
                    ]\
                },\
                {\
                    "carrier": "fedex",\
                    "service_type": "FEDEX_GROUND",\
                    "tracking_number": "fedex_tracking_number",\
                    "label_created_at": "2026-06-05T14:27:32.000000Z",\
                    "estimated_delivery_date": "2026-06-08T15:14:53.000000Z",\
                    "delivered_at": "2026-06-08T15:14:53.000000Z",\
                    "tracking_status": {\
                        "derived_status": "Delivered",\
                        "derived_status_code": "DL",\
                        "event_type": "DL",\
                        "event_description": "Delivered",\
                        "city": "delivered_city",\
                        "state": "delivered_state",\
                        "date": "2026-06-08T15:14:53.000000Z"\
                    },\
                    "shipment_contents": [\
                        {\
                            "parent_model": "AF14X14X1A-M13",\
                            "quantity": 4\
                        }\
                    ]\
                }\
            ],
            "total": {
                "subtotal": 200.6,
                "shipping_cost": 12.66,
                "tax": {
                    "amount": 17.86,
                    "rate": 8.4,
                    "rate_type": "percent",
                    "jurisdiction": "NV"
                },
                "amount": 231.12,
                "currency": "USD"
            },
            "fulfilled_at": "2026-02-21T19:58:46.000000Z",
            "created_at": "2026-02-21T19:58:46.000000Z",
            "updated_at": "2026-02-21T19:58:46.000000Z",
        }
    }
}
```

## POST  Build custom filter

Build your custom filter and get parent model.

`POST /api/v1/build-custom-filter`

cURLPHPJavaScriptPython

```bash
curl https://filterking.com/api/v1/build-custom-filter  \
  -X POST \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: your-unique-key-here" \
  -d '{
    "items": [\
      {\
        "size": "11.625x14.5x2a",\
        "merv": "M11",\
        "quantity": 2\
      }\
    ]
}'
```

```php
<?php
$client = new GuzzleHttp\Client();

$response = $client->post('https://filterking.com/api/v1/build-custom-filter', [\
    'headers' => [\
        'Authorization' => 'Bearer ' . $accessToken,\
        'Idempotency-Key' => 'your-unique-key-here',\
    ],\
    'json' => [\
        'items' => [\
            [\
                'size' => '11.625x14.5x2a',\
                'merv' => 'M11',\
                'quantity' => 2\
            ]\
        ]\
    ]\
]);

$result = json_decode($response->getBody(), true);
```

```javascript
const response = await fetch('https://filterking.com/api/v1/build-custom-filter', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Idempotency-Key': 'your-unique-key-here',
  },
  body: JSON.stringify({
    "items": [\
      {\
        "size": "11.625x14.5x2a",\
        "merv": "M11",\
        "quantity": 2\
      }\
    ]
  })
});

const result = await response.json();
```

```python
headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json',
    'Idempotency-Key': 'your-unique-key-here'
}

data = {
    "items": [\
      {\
        "size": "11.625x14.5x2a",\
        "merv": "M11",\
        "quantity": 2\
      }\
    ]
}

response = requests.post(
    'https://filterking.com/api/v1/build-custom-filter',
    headers=headers,
    json=data
)

result = response.json()
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `items` | `array` | Array of filter items (required, Minimum: 1 and Maximum: 10 items)

| items\[\] Attributes |
| --- |
| Attribute | Type | Description |
| --- | --- | --- |
| `size` | `string` | Filter size in format: {width}x{height}x{thickness} (e.g., 11.625x14.5x1). With or without ending "a" for actual size (e.g., 11.625x14.5x1a). **Required.** |
| `merv` | `string` | MERV rating: M8, M11, M13, or CO. **Required.** |
| `quantity` | `integer` | Number of units (minimum: 1, default: 1). **Required.** | |

**Accepted MERV ratings:**`M8` (MERV 8), `M11` (MERV 11), `M13` (MERV 13), `CO` (Carbon)


**Size format:** {width}x{height}x{thickness} (e.g., `11.625x14.5x1`)


**Thickness:** Only `0.5`, `1`, `2`, or `4` inches are accepted.


**Width and height measurements** must use standard fractional increments. Accepted decimal values: `.125` (1/8"), `.25` (1/4"), `.375` (3/8"), `.5` (1/2"), `.625` (5/8"), `.75` (3/4"), or `.875` (7/8").


### Response

JSON • 201 Created

```json
{
    "success": true,
    "data": {
        "items": [\
            {\
                "parent_model": "AF11.625x14.5x2A-M11",\
                "size": "11.625x14.5x2a",\
                "actual_size": "11.625 x 14.5 x 1.75",\
                "quantity": 2,\
                "unit_price": 12.48,\
                "item_price": 24.96\
            }\
        ]
    }
}
```

# Webhooks

Webhooks enable real-time notifications from Filter King to your application when specific events occur on your orders.
Instead of repeatedly polling our API to check for status changes, you can configure webhook endpoints to receive
automated push notifications as events happen.


### How Webhooks Work

When you configure a webhook, you provide a URL endpoint on your server where Filter King will send HTTP POST requests
whenever subscribed events occur. Each webhook contains detailed information about the event, allowing your application
to react immediately without manual intervention.


**Key Benefits:** Webhooks eliminate the need for polling, reduce API usage, and ensure your system stays
synchronized with order events in near real-time. Each webhook delivery attempt is logged, providing visibility into
the success or failure of each notification.


### Webhook Flow

1. You configure a webhook endpoint URL in your Filter King dashboard
2. Subscribe to specific events (e.g., `order.shipped`)
3. When the event occurs, Filter King sends a POST request to your endpoint
4. Your server processes the payload and responds with a 2xx status code
5. If delivery fails, Filter King retries with exponential backoff

Sequence Diagram

```bash
Your Server                          Filter King
    |                                       |
    |  1. Configure webhook endpoint       |
    |<--------------------------------------|
    |                                       |
    |  2. Subscribe to events               |
    |<--------------------------------------|
    |                                       |
    |  3. Order ships                       |
    |                                       |
    |  4. Webhook notification (POST)       |
    |<--------------------------------------|
    |                                       |
    |  5. Process payload                   |
    |  6. Respond 200 OK                   |
    |-------------------------------------->|
    |                                       |
    |  [Delivery confirmed]                |
    |                                       |
```

## Configuring Webhooks

Webhook configuration is managed through the Filter King dashboard. Navigate to **API Management → Webhooks**
to add, edit, or remove your webhook endpoints.


### Webhook Configuration Fields

| Field | Type | Description |
| --- | --- | --- |
| `URL` | `string` | The HTTPS endpoint where webhook events will be sent. Must be a publicly accessible URL. |
| `Events` | `array` | List of event types to subscribe to. Currently supports `order.shipped`. |
| `Secret` | `string` | Optional HMAC signing secret (minimum 16 characters). Used to verify webhook authenticity. |
| `Active` | `boolean` | Toggle webhook on/off without deleting configuration. Default: `true`. |

**URL Requirements:** Your webhook endpoint must be accessible over HTTPS and respond within 10 seconds.
While testing, you can use tools like [webhook.site](https://webhook.site/)
or [ngrok](https://ngrok.com/) to create temporary public endpoints.


### Implementation Example: Webhook Handler

PHPJavaScript (Node.js)Python

```php
<?php
// webhook-handler.php

// Get the raw POST data
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';

// Your webhook secret from dashboard
$webhookSecret = 'your_webhook_secret_here';

// Verify signature if secret is configured
if (!empty($webhookSecret)) {
    $expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);

    if (!hash_equals($expectedSignature, $signature)) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid signature']);
        exit;
    }
}

// Parse the payload
$event = json_decode($payload, true);

if (!$event) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Process based on event type
$eventType = $event['event'] ?? '';

switch ($eventType) {
    case 'order.shipped':
        handleOrderShipped($event);
        break;

    default:
        // Log unknown event types
        error_log("Unknown event type: $eventType");
}

// Respond with 200 OK to acknowledge receipt
http_response_code(200);
echo json_encode(['success' => true]);

function handleOrderShipped($event)
{
    $orderId = $event['data']['order_id'] ?? null;
    $poNumber = $event['data']['po_number'] ?? null;
    $status = $event['data']['status'] ?? null;

    // Update your local database
    // updateOrderStatus($orderId, $status);

    // Process shipment details
    foreach ($event['data']['shipments'] ?? [] as $shipment) {
        $trackingNumber = $shipment['tracking_number'];
        $carrier = $shipment['carrier'];

        // Store tracking information
        // storeTrackingInfo($orderId, $trackingNumber, $carrier);
    }

    // Trigger any business logic (notifications, inventory updates, etc.)
    // triggerShippedNotifications($orderId, $poNumber);
}
```

```javascript
// webhook-handler.js (Express.js)
const express = require('express');
const crypto = require('crypto');
const app = express();

// Your webhook secret from dashboard
const WEBHOOK_SECRET = 'your_webhook_secret_here';

app.post('/webhooks/filterking', express.raw({ type: 'application/json' }), (req, res) => {
    const payload = req.body;
    const signature = req.get('X-Webhook-Signature') || '';

    // Verify signature if secret is configured
    if (WEBHOOK_SECRET) {
        const expectedSignature = crypto
            .createHmac('sha256', WEBHOOK_SECRET)
            .update(payload)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('Invalid webhook signature');
            return res.status(401).json({ error: 'Invalid signature' });
        }
    }

    // Parse the event
    let event;
    try {
        event = JSON.parse(payload.toString());
    } catch (err) {
        console.error('Invalid JSON payload');
        return res.status(400).json({ error: 'Invalid JSON' });
    }

    // Process based on event type
    const eventType = event.event;

    switch (eventType) {
        case 'order.shipped':
            handleOrderShipped(event);
            break;
        default:
            console.log(`Unknown event type: ${eventType}`);
    }

    // Respond with 200 OK to acknowledge receipt
    res.status(200).json({ success: true });
});

function handleOrderShipped(event) {
    const { order_id, po_number, status, shipments } = event.data;

    console.log(`Order ${order_id} (${po_number}) has been ${status}`);

    // Update your local database
    // await updateOrderStatus(order_id, status);

    // Process shipment details
    shipments.forEach(shipment => {
        const { tracking_number, carrier } = shipment;
        console.log(`Tracking: ${carrier} - ${tracking_number}`);

        // Store tracking information
        // await storeTrackingInfo(order_id, tracking_number, carrier);
    });

    // Trigger any business logic
    // await triggerShippedNotifications(order_id, po_number);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook server listening on port ${PORT}`);
});
```

```python
# webhook_handler.py (Flask)
from flask import Flask, request, jsonify
import hmac
import hashlib

app = Flask(__name__)

# Your webhook secret from dashboard
WEBHOOK_SECRET = 'your_webhook_secret_here'

@app.route('/webhooks/filterking', methods=['POST'])
def handle_webhook():
    payload = request.get_data(as_text=False)
    signature = request.headers.get('X-Webhook-Signature', '')

    # Verify signature if secret is configured
    if WEBHOOK_SECRET:
        expected_signature = hmac.new(
            WEBHOOK_SECRET.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, signature):
            print('Invalid webhook signature')
            return jsonify({'error': 'Invalid signature'}), 401

    # Parse the event
    try:
        event = request.get_json()
    except:
        print('Invalid JSON payload')
        return jsonify({'error': 'Invalid JSON'}), 400

        if not hmac.compare_digest(expected_signature, received_signature):
            print('Invalid webhook signature')
            return jsonify({'error': 'Invalid signature'}), 401

    # Process based on event type
    event_type = event.get('event')

    if event_type == 'order.shipped':
        handle_order_shipped(event)
    else:
        print(f'Unknown event type: {event_type}')

    # Respond with 200 OK to acknowledge receipt
    return jsonify({'success': True}), 200

def handle_order_shipped(event):
    data = event.get('data', {})
    order_id = data.get('order_id')
    po_number = data.get('po_number')
    status = data.get('status')
    shipments = data.get('shipments', [])

    print(f'Order {order_id} ({po_number}) has been {status}')

    # Update your local database
    # update_order_status(order_id, status)

    # Process shipment details
    for shipment in shipments:
        tracking_number = shipment.get('tracking_number')
        carrier = shipment.get('carrier')
        print(f'Tracking: {carrier} - {tracking_number}')

        # Store tracking information
        # store_tracking_info(order_id, tracking_number, carrier)

    # Trigger any business logic
    # trigger_shipped_notifications(order_id, po_number)

if __name__ == '__main__':
    app.run(port=3000)
```

## Webhook Events

Filter King currently supports the following webhook events. More events will be added in the future.


### order.shipped

Triggered when an order's shipping label has been created and tracking information is available.
This event fires when the order status changes to `partially shipped` or `fulfilled`.


**Important:** The `order.shipped` webhook contains comprehensive shipment details including
carrier information, tracking numbers, estimated delivery dates, and the complete contents of each shipment.


### Event Payload Structure

JSON Payload

```json
{
    "id": "evt_ofjkTd4d1MZ8ODBs4G20cR06xChsrarB",
    "event": "order.shipped",
    "data": {
        "order_id": 12345678,
        "po_number": "AB332454",
        "status": "fulfilled",
        "created_at": "2026-07-27T18:45:05.000000Z",
        "shipped_at": "2026-07-27T23:05:06.000000Z",
        "shipments": [\
            {\
                "carrier": "fedex",\
                "service_type": "GROUND_HOME_DELIVERY",\
                "tracking_number": "874945190000",\
                "label_created_at": "2026-07-27T19:05:06.072721Z",\
                "estimated_delivery_date": "2026-07-29T00:00:00.000000Z",\
                "delivered_at": "2026-08-13T18:35:06.266918Z",\
                "tracking_status": {\
                    "city": null,\
                    "date": "2026-07-27T19:07:00.000000Z",\
                    "derived_status": "Label created",\
                    "derived_status_code": "IN",\
                    "event_description": "Shipment information sent to FedEx",\
                    "event_type": "OC",\
                    "state": null\
                },\
                "shipment_contents": [\
                    {\
                        "parent_model": "AF20x25x1-M11",\
                        "quantity": 4\
                    },\
                    {\
                        "parent_model": "AF20x20x1-M11",\
                        "quantity": 4\
                    }\
                ]\
            }\
        ]
    },
    "created_at": "2026-08-13T18:35:06.264647Z"
}
```

### Payload Field Descriptions

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique webhook event ID (prefixed with `evt_`) |
| `event` | `string` | Event type that triggered this webhook |
| `data` | `object` | Event-specific data payload |
| `data.order_id` | `integer` | Filter King internal order ID |
| `data.po_number` | `string` | Purchase order number (if provided during order creation) |
| `data.status` | `string` | Current order status |
| `data.created_at` | `string` | Order creation timestamp (ISO 8601 UTC) |
| `data.shipped_at` | `string` | Shipment timestamp (ISO 8601 UTC) |
| `data.shipments` | `array` | List of shipments for this order (may contain multiple shipments) |
| `shipments[].carrier` | `string` | Shipping carrier (e.g., `fedex`) |
| `shipments[].service_type` | `string` | Carrier service type (e.g., `GROUND_HOME_DELIVERY`, `FEDEX_GROUND`) |
| `shipments[].tracking_number` | `string` | Carrier tracking number for the shipment |
| `shipments[].label_created_at` | `string` | Shipping label creation timestamp (ISO 8601 UTC) |
| `shipments[].estimated_delivery_date` | `string` | Carrier's estimated delivery date (ISO 8601 UTC) |
| `shipments[].delivered_at` | `string` | Actual delivery timestamp (ISO 8601 UTC), `null` if not yet delivered |
| `shipments[].tracking_status` | `object` | Latest tracking status information from the carrier |
| `tracking_status.derived_status` | `string` | Human-readable status (e.g., "Label created", "In Transit", "Delivered") |
| `tracking_status.derived_status_code` | `string` | Two-letter status code (e.g., `IN`, `IT`, `DL`) |
| `tracking_status.event_type` | `string` | Carrier-specific event type code |
| `tracking_status.event_description` | `string` | Detailed description of the tracking event |
| `tracking_status.city` | `string` | City where the tracking event occurred (if applicable) |
| `tracking_status.state` | `string` | State where the tracking event occurred (if applicable) |
| `shipments[].shipment_contents` | `array` | List of filter items included in this shipment |
| `shipment_contents[].parent_model` | `string` | Filter parent model (e.g., `AF20x25x1-M11`) |
| `shipment_contents[].quantity` | `integer` | Quantity of this item in the shipment |
| `created_at` | `string` | Webhook event creation timestamp (ISO 8601 UTC) |

**Signature Header:** If you configured a webhook secret, the `X-Webhook-Signature` HTTP header
will contain the HMAC-SHA256 signature. See the [Signature Verification](https://filterking.com/api/v1/documentation#webhooks-signature) section for details.


## Signature Verification

To ensure webhook authenticity and prevent fraudulent requests, Filter King supports HMAC-SHA256 signature verification.
When you configure a webhook secret in your dashboard, each webhook request includes an `X-Webhook-Signature`
HTTP header containing the signature that you can use to verify the request originated from Filter King.


### How Signature Verification Works

1. When configuring your webhook, generate and securely store a secret (minimum 16 characters)
2. Filter King computes an HMAC-SHA256 hash of the JSON payload using your secret
3. The signature is sent in the `X-Webhook-Signature` HTTP header
4. Your server reads the header and recomputes the HMAC using the same secret
5. If signatures match, the webhook is authentic; otherwise, reject the request with a 401 status

### Computing the Signature

The signature is computed as:


`signature = HMAC-SHA256(raw_json_payload, webhook_secret)`

PHPJavaScript (Node.js)Python

```php
<?php
$payload = file_get_contents('php://input');
$webhookSecret = 'your_webhook_secret';

$receivedSignature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';
$expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);

// Use hash_equals to prevent timing attacks
if (hash_equals($expectedSignature, $receivedSignature)) {
    // Signature is valid, process the webhook
    $event = json_decode($payload, true);
} else {
    // Invalid signature, reject with 401
    http_response_code(401);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}
```

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    // Use timing-safe comparison
    return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
    );
}

// Usage
const payload = req.body; // Or raw body if using express.raw()
const signature = req.get('X-Webhook-Signature');
const secret = 'your_webhook_secret';

if (verifySignature(payload, signature, secret)) {
    // Signature is valid, process the webhook
} else {
    // Invalid signature, reject with 401
    res.status(401).send('Invalid signature');
}
```

```python
import hmac
import hashlib

def verify_signature(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()

    # Use hmac.compare_digest to prevent timing attacks
    return hmac.compare_digest(expected_signature, signature)

# Usage
payload = request.get_data(as_text=False)
signature = request.headers.get('X-Webhook-Signature', '')
secret = 'your_webhook_secret'

if verify_signature(payload.decode(), signature, secret):
    # Signature is valid, process the webhook
    event = request.get_json()
else:
    # Invalid signature, reject with 401
    return jsonify({'error': 'Invalid signature'}), 401
```

**Security Best Practice:** Always use timing-safe comparison functions when verifying signatures to prevent
timing attacks. In PHP, use `hash_equals()`; in Node.js, use `crypto.timingSafeEqual()`;
in Python, use `hmac.compare_digest()`.


## Retry Logic

If your webhook endpoint fails to respond or returns a non-2xx status code, Filter King will automatically retry
delivery with exponential backoff. This ensures temporary network issues or server downtime don't result in lost events.


### Retry Configuration

| Setting | Value |
| --- | --- |
| **Maximum Attempts** | 3 attempts (initial + 2 retries) |
| **Request Timeout** | 10 seconds per attempt |
| **Retry Delays** | 60s, 120s, 180s (exponential backoff) |

### Retry Behavior

- **First attempt:** Immediate delivery
- **Second attempt:** 60 seconds after first failure
- **Third attempt:** 120 seconds after second failure
- **Final attempt:** 180 seconds after third failure
- **After 3 failed attempts:** Webhook is marked as permanently failed

**Responding to Webhooks:** Always respond with a 2xx status code as quickly as possible.
If you need to perform time-consuming processing, acknowledge the webhook immediately and process the payload
asynchronously in the background.


### Delivery Logs

All webhook delivery attempts are logged in the Filter King dashboard. You can view detailed logs including:


- Number of attempts made
- HTTP status code received
- Response body (truncated to 1000 characters)
- Timestamps of each attempt
- Final delivery status

## Best Practices

### 1\. Quick Acknowledgment

Respond to webhooks as quickly as possible, ideally within 1-2 seconds. If processing requires significant time,
acknowledge immediately (200 OK) and handle the payload asynchronously:


PHPJavaScript (Node.js)

```php
<?php
// Validate and acknowledge immediately
$payload = file_get_contents('php://input');
$event = json_decode($payload, true);

if ($event) {
    // Queue for background processing
    enqueueWebhookForProcessing($event);

    // Respond immediately
    http_response_code(200);
    echo json_encode(['success' => true]);
}
```

```javascript
app.post('/webhooks', (req, res) => {
    const event = req.body;

    // Queue for background processing
    queueJob('process-webhook', event);

    // Respond immediately
    res.status(200).json({ success: true });
});
```

### 2\. Idempotent Processing

Webhooks may be delivered multiple times (retries or duplicate events). Design your webhook handler to be idempotent:


- Check if the event has already been processed using the unique event ID
- Use database transactions or unique constraints to prevent duplicate operations
- Make processing operations safe to run multiple times

PHPJavaScript (Node.js)

```php
<?php
$eventId = $event['id'];

// Check if already processed
if (webhookAlreadyProcessed($eventId)) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Already processed']);
    exit;
}

// Process the webhook
processOrderShipped($event);

// Mark as processed
markWebhookAsProcessed($eventId);

http_response_code(200);
echo json_encode(['success' => true]);
```

```javascript
const eventId = event.id;

// Check if already processed
const alreadyProcessed = await checkProcessedEvent(eventId);

if (alreadyProcessed) {
    return res.status(200).json({
        success: true,
        message: 'Already processed'
    });
}

// Process the webhook
await processOrderShipped(event);

// Mark as processed
await markEventProcessed(eventId);

res.status(200).json({ success: true });
```

### 3\. Secure Your Endpoint

- Always use HTTPS endpoints in production
- Configure and verify webhook signatures
- Consider implementing IP whitelisting if needed
- Validate the payload structure before processing

### 4\. Error Handling

- Log all received webhooks for debugging
- Log processing failures separately from delivery failures
- Implement alerts for repeated delivery failures
- Monitor webhook delivery logs in the Filter King dashboard

### 5\. Testing

- Test webhook handlers locally using tools like ngrok or webhook.site
- Create test orders to verify webhook delivery
- Test signature verification with your configured secret
- Test failure scenarios (invalid signature, malformed JSON, etc.)

**Pro Tip:** Use the Filter King dashboard to view webhook delivery logs and retry failed webhooks manually
if needed. You can also test your webhook endpoint with sample payload data from the dashboard.


Need help? Contact our support team.