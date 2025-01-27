-- Create the `leads` table
CREATE TABLE leads (
    phone VARCHAR(15) PRIMARY KEY, 
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    company VARCHAR(255),
    status VARCHAR(50),
    joinDate TIMESTAMP,  
    source VARCHAR(255),
    agent VARCHAR(255),
    additional_info VARCHAR(500)
);

-- Create the `products` table
CREATE TABLE products (
    id SERIAL PRIMARY KEY, -- Auto-increment ID for product
    lead_phone VARCHAR(15) NOT NULL, -- Foreign key linking to leads table by phone number
    productName VARCHAR(255) NOT NULL,   
    viewDate TIMESTAMP, -- Use TIMESTAMP instead of DATETIME
    FOREIGN KEY (lead_phone) REFERENCES leads(phone) ON DELETE CASCADE
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    verification_token VARCHAR(40) UNIQUE,
    verified BOOLEAN DEFAULT false
);


-- Insert data into `leads` table
INSERT INTO leads (phone, name, email, location, company, status, joinDate, source, agent)
VALUES (
    '0544567890', -- Example phone number
    'Name Example',
    'example@example.com',
    'City, Country',
    'Company Name',
    'New',
    '2025-01-01 00:00:00',
    'Web',
    'Agent Name'
);

-- Insert data into `products` table
INSERT INTO products (lead_phone, productName, viewDate)
VALUES 
    ('1234567890', 'Product 1', '2025-01-01 00:00:00'),
    ('1234567890', 'Product 2', '2025-01-02 00:00:00');


-- Insert data into `leads` table
INSERT INTO leads (phone, name, email, location, company, status, joinDate, source, agent)
VALUES (
    '0521234567', -- Example phone number
    'John Doe', -- Example name
    'john.doe@example.com', -- Example email
    'Tel Aviv, Israel', -- Example location
    'Tech Solutions Ltd.', -- Example company
    'Active', -- Example status
    '2025-01-10 14:30:00', -- Example join date
    'Social Media', -- Example source
    'Sarah Lee' -- Example agent
);

-- Insert data into `products` table
INSERT INTO products (lead_phone, productName, viewDate)
VALUES 
    ('0521234567', 'Smartphone X', '2025-01-11 10:00:00'), -- Example product 1
    ('0521234567', 'Laptop Pro', '2025-01-12 15:45:00'); -- Example product 2


ALTER TABLE users 
ADD COLUMN reset_token VARCHAR(100) UNIQUE,
ADD COLUMN reset_token_expires TIMESTAMP;
