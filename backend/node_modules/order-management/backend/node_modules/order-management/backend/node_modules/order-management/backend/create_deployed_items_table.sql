-- Create deployed_items table to track deployed items
-- Run this script on your MySQL database

CREATE TABLE IF NOT EXISTS deployed_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    order_id INT NOT NULL,
    order_date DATETIME NOT NULL,
    confirm_date DATETIME,
    deploy_date DATETIME NOT NULL,
    comment TEXT,
    item_comment TEXT,
    ordered_by VARCHAR(255),
    serial_number VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_serial_number (serial_number),
    INDEX idx_order_id (order_id),
    INDEX idx_deploy_date (deploy_date),
    INDEX idx_original_order_id (original_order_id)
);

-- Verify the table was created
DESCRIBE deployed_items; 