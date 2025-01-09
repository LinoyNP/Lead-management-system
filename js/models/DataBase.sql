-- Create the database ZLqH2NWj$pu5#qd
SUPABASE_DB_URL=postgresql://postgres:[ZLqH2NWj$pu5#qd]@db.zytuhnekhcxxdrlphsda.supabase.co:5432/postgres

CREATE DATABASE LeadsDataBase;

-- Create the `leads` table
CREATE TABLE leads (
    phone VARCHAR(15) PRIMARY KEY, 
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    location VARCHAR(255),
    company VARCHAR(255),
    status VARCHAR(50),
    joinDate TIMESTAMP,  
    source VARCHAR(255),
    agent VARCHAR(255)  
);

-- Create the `products` table
CREATE TABLE products (
    id SERIAL PRIMARY KEY, -- Auto-increment ID for product
    lead_phone VARCHAR(15) NOT NULL, -- Foreign key linking to leads table by phone number
    productName VARCHAR(255) NOT NULL,   
    viewDate TIMESTAMP, -- Use TIMESTAMP instead of DATETIME
    FOREIGN KEY (lead_phone) REFERENCES leads(phone) ON DELETE CASCADE
);



-- Insert data into `leads` table
INSERT INTO leads (phone, name, email, location, company, status, joinDate, source, agent)
VALUES (
    '1234567890', -- Example phone number
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
