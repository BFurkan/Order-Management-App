# API Reference - Order Management System

## Base URL
```
http://localhost:3007
```

## Authentication
Currently, the API does not require authentication tokens. All endpoints are publicly accessible.

## Response Format
All API responses follow this standard format:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {} // Optional data payload
}
```

---

## Products API

### Get All Products
**GET** `/products`

Returns all products in the system.

**Response:**
```json
[
  {
    "id": 1,
    "product_name": "ThinkPad X1 Carbon",
    "description": "14-inch business laptop",
    "price": 1299.99,
    "image": "/images/1723053669508.jpg",
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
]
```

### Add New Product
**POST** `/products`

Adds a new product to the system.

**Content-Type:** `multipart/form-data`

**Parameters:**
- `product_name` (string, required): Product name
- `description` (string, optional): Product description
- `price` (number, optional): Product price
- `image` (file, optional): Product image

**Request Example:**
```javascript
const formData = new FormData();
formData.append('product_name', 'ThinkPad X1 Carbon');
formData.append('description', '14-inch business laptop');
formData.append('price', '1299.99');
formData.append('image', fileInput.files[0]);

fetch('/products', {
  method: 'POST',
  body: formData
});
```

**Response:**
```json
{
  "success": true,
  "message": "Product added successfully",
  "product": {
    "id": 1,
    "product_name": "ThinkPad X1 Carbon",
    "image": "/images/1723053669508.jpg"
  }
}
```

### Update Product
**PUT** `/products/:id`

Updates an existing product.

**Content-Type:** `multipart/form-data`

**Parameters:**
- `product_name` (string, optional): Product name
- `description` (string, optional): Product description
- `price` (number, optional): Product price
- `image` (file, optional): Product image

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully"
}
```

### Delete Product
**DELETE** `/products/:id`

Deletes a product from the system.

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Orders API

### Get All Orders
**GET** `/orders`

Returns all orders in the system.

**Response:**
```json
[
  {
    "id": 1,
    "product_id": 1,
    "quantity": 5,
    "ordered_by": "john.doe@company.com",
    "order_date": "2025-01-15T10:30:00.000Z",
    "order_id": 123,
    "comment": "For new employees",
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
]
```

### Place New Order
**POST** `/orders`

Places a new order.

**Content-Type:** `application/json`

**Parameters:**
- `product_id` (number, required): Product ID
- `quantity` (number, required): Order quantity
- `ordered_by` (string, required): Email address of requester

**Request Example:**
```json
{
  "product_id": 1,
  "quantity": 5,
  "ordered_by": "john.doe@company.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order_id": 123
}
```

### Place Bulk Orders
**POST** `/bulk-orders`

Places multiple orders at once.

**Content-Type:** `application/json`

**Parameters:**
- `orders` (array, required): Array of order objects
  - `product_id` (number, required): Product ID
  - `quantity` (number, required): Order quantity
- `ordered_by` (string, required): Email address of requester

**Request Example:**
```json
{
  "orders": [
    {
      "product_id": 1,
      "quantity": 3
    },
    {
      "product_id": 2,
      "quantity": 2
    }
  ],
  "ordered_by": "john.doe@company.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk orders placed successfully",
  "order_id": 124
}
```

### Update Order ID
**PUT** `/update-order-id`

Updates the order ID for an order.

**Content-Type:** `application/json`

**Parameters:**
- `order_id` (number, required): Current order ID
- `new_order_id` (number, required): New order ID

**Response:**
```json
{
  "success": true,
  "message": "Order ID updated successfully"
}
```

---

## Confirmed Items API

### Get All Confirmed Items
**GET** `/confirmed-items`

Returns all confirmed items, excluding those that have been deployed.

**Response:**
```json
[
  {
    "id": 1,
    "order_id": 123,
    "product_id": 1,
    "product_name": "ThinkPad X1 Carbon",
    "quantity": 1,
    "serial_number": "SN001234",
    "ordered_by": "john.doe@company.com",
    "order_date": "2025-01-15T10:30:00.000Z",
    "confirm_date": "2025-01-16T14:20:00.000Z",
    "item_comment": "Ready for deployment",
    "comment": "All items received in good condition",
    "image": "/images/1723053669508.jpg",
    "created_at": "2025-01-16T14:20:00.000Z",
    "updated_at": "2025-01-16T14:20:00.000Z"
  }
]
```

### Confirm Order
**POST** `/confirm`

Confirms an order and creates confirmed items.

**Content-Type:** `application/json`

**Parameters:**
- `order_id` (number, required): Order ID
- `product_id` (number, required): Product ID
- `serial_numbers` (array, required): Array of serial numbers
- `comment` (string, optional): Confirmation comment

**Request Example:**
```json
{
  "order_id": 123,
  "product_id": 1,
  "serial_numbers": ["SN001234", "SN001235", "SN001236"],
  "comment": "All items received in good condition"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order confirmed successfully"
}
```

### Update Comment
**PUT** `/update-comment`

Updates the comment for a confirmed item.

**Content-Type:** `application/json`

**Parameters:**
- `item_id` (number, required): Confirmed item ID
- `comment` (string, required): New comment

**Response:**
```json
{
  "success": true,
  "message": "Comment updated successfully"
}
```

---

## Deployed Items API

### Get All Deployed Items
**GET** `/deployed-items`

Returns all deployed items.

**Response:**
```json
[
  {
    "id": 1,
    "order_id": 123,
    "product_id": 1,
    "product_name": "ThinkPad X1 Carbon",
    "serial_number": "SN001234",
    "ordered_by": "john.doe@company.com",
    "order_date": "2025-01-15T10:30:00.000Z",
    "confirm_date": "2025-01-16T14:20:00.000Z",
    "deploy_date": "2025-01-17T09:15:00.000Z",
    "item_comment": "Deployed to John Doe",
    "image": "/images/1723053669508.jpg",
    "created_at": "2025-01-17T09:15:00.000Z",
    "updated_at": "2025-01-17T09:15:00.000Z"
  }
]
```

### Deploy Item
**POST** `/deploy-item`

Deploys a confirmed item.

**Content-Type:** `application/json`

**Parameters:**
- `serial_number` (string, required): Serial number of item to deploy

**Request Example:**
```json
{
  "serial_number": "SN001234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item deployed successfully"
}
```

### Undeploy Item
**POST** `/undeploy-item`

Undeploys a deployed item.

**Content-Type:** `application/json`

**Parameters:**
- `item_id` (number, required): Deployed item ID
- `serial_number` (string, required): Serial number

**Request Example:**
```json
{
  "item_id": 1,
  "serial_number": "SN001234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item undeployed successfully"
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Error Examples

#### Invalid Product ID
```json
{
  "success": false,
  "message": "Product not found",
  "error": "Product with ID 999 does not exist"
}
```

#### Missing Required Fields
```json
{
  "success": false,
  "message": "Missing required fields",
  "error": "product_id is required"
}
```

#### Database Error
```json
{
  "success": false,
  "message": "Database error",
  "error": "Connection failed"
}
```

---

## File Upload

### Image Upload Guidelines
- **Supported Formats**: JPG, JPEG, PNG, GIF
- **Maximum Size**: 5MB
- **Storage**: Local file system in `/public/images/`
- **Naming**: Automatic timestamp-based naming

### Upload Example
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

fetch('/products', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Upload successful:', data);
});
```

---

## Data Validation

### Product Validation
- `product_name`: Required, max 255 characters
- `description`: Optional, text
- `price`: Optional, numeric, positive
- `image`: Optional, valid image file

### Order Validation
- `product_id`: Required, must exist in products table
- `quantity`: Required, positive integer
- `ordered_by`: Required, valid email format

### Confirmation Validation
- `order_id`: Required, must exist in orders table
- `product_id`: Required, must match order
- `serial_numbers`: Required, array of non-empty strings

### Deployment Validation
- `serial_number`: Required, must exist in confirmed_items table

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

---

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3003` (development)
- `http://10.167.49.200:3003` (production)

---

## Testing the API

### Using curl

#### Get Products
```bash
curl -X GET http://10.167.49.200:3004/products
```

#### Add Product
```bash
curl -X POST http://10.167.49.200:3004/products \
  -F "product_name=Test Product" \
  -F "description=Test Description" \
  -F "price=99.99" \
  -F "image=@/path/to/image.jpg"
```

#### Place Order
```bash
curl -X POST http://10.167.49.200:3004/orders \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 2,
    "ordered_by": "test@example.com"
  }'
```

### Using Postman

1. **Import Collection**: Create a new collection
2. **Set Base URL**: `http://10.167.49.200:3004`
3. **Add Requests**: Create requests for each endpoint
4. **Test**: Execute requests and verify responses

---

## Monitoring and Logging

### Log Format
```
[timestamp] [level] [endpoint] [method] [status] [duration]ms
```

### Example Logs
```
[2025-01-15 10:30:00] [INFO] /products [GET] [200] 45ms
[2025-01-15 10:31:00] [ERROR] /orders [POST] [400] 12ms
```

### Health Check
**GET** `/health`

Returns system health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "database": "connected",
  "uptime": "2h 30m 15s"
}
```

---

## Versioning

Current API version: `v1`

No versioning is currently implemented. Consider adding versioning for future updates.

---

## Deprecation Policy

No endpoints are currently deprecated. When deprecating endpoints:
1. Announce deprecation 6 months in advance
2. Maintain backward compatibility for 3 months
3. Remove deprecated endpoints after 9 months

---

*Last Updated: January 2025*
*API Version: 1.0.0* 