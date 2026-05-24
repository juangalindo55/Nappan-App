# Nappan MVP API Contracts

## Purpose

Define the request and response expectations for the app’s server and service boundaries.

## Shipping Quote

### Endpoint

`POST /api/shipping/quote`

### Request

```json
{
  "destinationPostalCode": "01010"
}
```

### Success Response

```json
{
  "distanceKm": 12.4,
  "price": 95,
  "tierKm": 10
}
```

### Error Response

```json
{
  "error": "Unable to calculate shipping quote"
}
```

### Rules

- The API must validate input before calling external services.
- The API must return a deterministic failure shape when geocoding or routing fails.
- Pricing tiers must come from server-side config, not client-side assumptions.

## Customer Lookup

### Contract

Customer lookup is handled by the service layer and should return a normalized profile object.

Expected result:

```json
{
  "name": "Customer Name",
  "phone": "+521234567890",
  "tierName": "Business",
  "tierSlug": "business",
  "discountPercent": 15
}
```

### Rules

- Lookup should accept normalized variants of the same phone number.
- Missing customer data should return a controlled null or not-found state.
- The service should not throw raw database errors into the UI.

## Product List

### Contract

Product fetching should return an array of normalized product objects.

Expected shape:

```json
[
  {
    "id": "prod_1",
    "name": "Lunch Box",
    "category": "Lunch Box",
    "price": 120,
    "active": true
  }
]
```

### Rules

- Inactive products should be filtered out before reaching the UI.
- Product ordering should be deterministic.

