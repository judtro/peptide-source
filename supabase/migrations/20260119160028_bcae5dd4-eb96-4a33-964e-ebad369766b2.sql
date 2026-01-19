-- Add currency column to vendor_products table
ALTER TABLE vendor_products 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Add price_usd column to store converted price for comparison
ALTER TABLE vendor_products 
ADD COLUMN IF NOT EXISTS price_usd NUMERIC;

-- Add price_per_mg_usd column to store converted price per mg for comparison
ALTER TABLE vendor_products 
ADD COLUMN IF NOT EXISTS price_per_mg_usd NUMERIC;

-- Add default_currency column to vendors table
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'USD';

-- Update known EU vendors with their currencies
UPDATE vendors SET default_currency = 'PLN' WHERE slug = 'x-peptidescom';
UPDATE vendors SET default_currency = 'PLN' WHERE slug = 'biowell-labs';

-- Update EU-region vendors to use EUR by default
UPDATE vendors SET default_currency = 'EUR' WHERE region = 'EU' AND default_currency = 'USD' AND slug NOT IN ('x-peptidescom', 'biowell-labs');

-- Add comments for documentation
COMMENT ON COLUMN vendor_products.currency IS 'Original currency of the price (USD, EUR, GBP, PLN, CHF)';
COMMENT ON COLUMN vendor_products.price_usd IS 'Price converted to USD for consistent comparison';
COMMENT ON COLUMN vendor_products.price_per_mg_usd IS 'Price per mg converted to USD for consistent comparison';
COMMENT ON COLUMN vendors.default_currency IS 'Default currency for this vendor (USD, EUR, GBP, PLN, CHF)';