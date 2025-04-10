-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the name column for faster searches
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

Insert some sample data
INSERT INTO products (name, price, quantity) VALUES
    ('Sample Product 1', 29.99, 100),
    ('Sample Product 2', 49.99, 50),
    ('Sample Product 3', 99.99, 25); 

