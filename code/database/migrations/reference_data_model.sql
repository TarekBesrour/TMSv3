```sql
-- Common reference table structure (example)
CREATE TABLE reference_data (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- e.g., 'country_code', 'unit_of_measure'
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'FR', 'KG'
    label_fr VARCHAR(255) NOT NULL,
    label_en VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Specific reference tables (examples)

-- country_codes
CREATE TABLE country_codes (
    id SERIAL PRIMARY KEY,
    reference_data_id INTEGER REFERENCES reference_data(id) ON DELETE CASCADE,
    iso_alpha2 VARCHAR(2) UNIQUE NOT NULL,
    iso_alpha3 VARCHAR(3) UNIQUE NOT NULL,
    dialing_code VARCHAR(10),
    -- Add other country-specific attributes as needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- unit_of_measures
CREATE TABLE unit_of_measures (
    id SERIAL PRIMARY KEY,
    reference_data_id INTEGER REFERENCES reference_data(id) ON DELETE CASCADE,
    category VARCHAR(50), -- e.g., 'weight', 'volume', 'distance'
    conversion_factor DECIMAL(10, 5), -- e.g., for converting to a base unit
    -- Add other unit-specific attributes as needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- vehicle_types
CREATE TABLE vehicle_types (
    id SERIAL PRIMARY KEY,
    reference_data_id INTEGER REFERENCES reference_data(id) ON DELETE CASCADE,
    max_weight_kg DECIMAL(10, 2),
    max_volume_m3 DECIMAL(10, 2),
    -- Add other vehicle type-specific attributes as needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- incoterms
CREATE TABLE incoterms (
    id SERIAL PRIMARY KEY,
    reference_data_id INTEGER REFERENCES reference_data(id) ON DELETE CASCADE,
    description_fr TEXT,
    description_en TEXT,
    -- Add other incoterm-specific attributes as needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- shipment_statuses
CREATE TABLE shipment_statuses (
    id SERIAL PRIMARY KEY,
    reference_data_id INTEGER REFERENCES reference_data(id) ON DELETE CASCADE,
    is_final BOOLEAN DEFAULT FALSE,
    is_cancellable BOOLEAN DEFAULT FALSE,
    -- Add other status-specific attributes as needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- postal_codes (example for a large, geographical reference)
CREATE TABLE postal_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    country_code VARCHAR(2) REFERENCES country_codes(iso_alpha2),
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    -- Add other postal code-specific attributes as needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- currencies
CREATE TABLE currencies (
    id SERIAL PRIMARY KEY,
    reference_data_id INTEGER REFERENCES reference_data(id) ON DELETE CASCADE,
    symbol VARCHAR(10),
    exchange_rate DECIMAL(10, 5),
    -- Add other currency-specific attributes as needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- holidays
CREATE TABLE holidays (
    id SERIAL PRIMARY KEY,
    reference_data_id INTEGER REFERENCES reference_data(id) ON DELETE CASCADE,
    holiday_date DATE NOT NULL,
    country_code VARCHAR(2) REFERENCES country_codes(iso_alpha2),
    -- Add other holiday-specific attributes as needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- service_types
CREATE TABLE service_types (
    id SERIAL PRIMARY KEY,
    reference_data_id INTEGER REFERENCES reference_data(id) ON DELETE CASCADE,
    description TEXT,
    -- Add other service type-specific attributes as needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- merchandise_categories
CREATE TABLE merchandise_categories (
    id SERIAL PRIMARY KEY,
    reference_data_id INTEGER REFERENCES reference_data(id) ON DELETE CASCADE,
    parent_category_id INTEGER REFERENCES merchandise_categories(id),
    -- Add other category-specific attributes as needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- incident_reasons
CREATE TABLE incident_reasons (
    id SERIAL PRIMARY KEY,
    reference_data_id INTEGER REFERENCES reference_data(id) ON DELETE CASCADE,
    is_critical BOOLEAN DEFAULT FALSE,
    -- Add other incident reason-specific attributes as needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

```

