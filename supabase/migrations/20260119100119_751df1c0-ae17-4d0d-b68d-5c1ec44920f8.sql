-- Link existing vendor_products to products table by matching product names
UPDATE vendor_products vp
SET product_id = p.id
FROM products p
WHERE vp.product_id IS NULL
  AND (
    LOWER(vp.product_name) LIKE '%' || LOWER(p.name) || '%'
    OR LOWER(p.name) LIKE '%' || LOWER(vp.product_name) || '%'
  );