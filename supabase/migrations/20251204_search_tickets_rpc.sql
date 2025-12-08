-- Function to search tickets by ID (prefix), ticket_code, or qr_code_data
CREATE OR REPLACE FUNCTION search_tickets(search_query text)
RETURNS SETOF tickets
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM tickets
  WHERE 
    id::text ILIKE search_query || '%' 
    OR ticket_code ILIKE search_query
    OR qr_code_data = search_query;
$$;
