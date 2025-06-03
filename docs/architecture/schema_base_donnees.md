# Schéma de Base de Données du TMS

## Introduction

Ce document présente la conception détaillée du schéma de base de données pour le Transport Management System (TMS). La base de données est conçue pour PostgreSQL et suit une approche multi-tenant où chaque client dispose de son propre schéma pour garantir l'isolation des données.

Le schéma est organisé en groupes fonctionnels correspondant aux modules principaux du TMS, avec des relations clairement définies entre les entités. Cette conception vise à optimiser à la fois la performance des requêtes et la maintenabilité du système.

## Architecture Multi-Tenant

Pour supporter le mode SaaS, nous utilisons une approche de "schéma par tenant" dans PostgreSQL :

- Un schéma `public` contient les tables partagées et les métadonnées des tenants
- Chaque client (tenant) dispose de son propre schéma nommé `client_[id]`
- Les requêtes sont automatiquement routées vers le schéma approprié via un middleware de résolution de tenant

Cette approche offre une bonne isolation des données tout en permettant des requêtes cross-tenant pour l'administration et le reporting global.

## Groupes Fonctionnels

Le schéma de base de données est organisé en plusieurs groupes fonctionnels :

1. **Partenaires et Entités** - Gestion des clients, transporteurs, sites et utilisateurs
2. **Commandes et Expéditions** - Gestion des commandes, tournées et livraisons
3. **Coûts et Facturation** - Gestion des tarifs, factures et paiements
4. **Flotte et Ressources** - Gestion des véhicules, conducteurs et équipements
5. **Analyse et Reporting** - Tables pour le reporting et l'analyse
6. **Intégration et Connectivité** - Tables pour les intégrations et l'EDI
7. **Administration et Configuration** - Tables système et de configuration

## Schéma Détaillé par Groupe Fonctionnel

### 1. Partenaires et Entités

#### Table: partners

Stocke les informations sur tous les partenaires commerciaux (clients et transporteurs).

```
partners (
    id SERIAL PRIMARY KEY,
    partner_code VARCHAR(50) UNIQUE NOT NULL,
    partner_type VARCHAR(20) NOT NULL, -- 'customer', 'carrier', 'supplier', etc.
    legal_name VARCHAR(200) NOT NULL,
    commercial_name VARCHAR(200),
    tax_id VARCHAR(50),
    registration_number VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'pending', 'blocked'
    rating DECIMAL(3,2),
    parent_id INTEGER REFERENCES partners(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
)
```

#### Table: partner_addresses

Stocke les adresses associées aux partenaires.

```
partner_addresses (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES partners(id),
    address_type VARCHAR(20) NOT NULL, -- 'billing', 'shipping', 'headquarters', etc.
    is_default BOOLEAN NOT NULL DEFAULT false,
    address_line1 VARCHAR(200) NOT NULL,
    address_line2 VARCHAR(200),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country_code CHAR(2) NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    geolocation GEOGRAPHY(POINT), -- PostGIS extension
    contact_name VARCHAR(100),
    contact_phone VARCHAR(30),
    contact_email VARCHAR(100),
    opening_hours JSONB,
    special_instructions TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: partner_contacts

Stocke les contacts associés aux partenaires.

```
partner_contacts (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES partners(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position VARCHAR(100),
    department VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(30),
    mobile VARCHAR(30),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: sites

Stocke les sites (entrepôts, usines, magasins, etc.).

```
sites (
    id SERIAL PRIMARY KEY,
    site_code VARCHAR(50) UNIQUE NOT NULL,
    site_name VARCHAR(200) NOT NULL,
    site_type VARCHAR(50) NOT NULL, -- 'warehouse', 'factory', 'store', 'cross-dock', etc.
    partner_id INTEGER REFERENCES partners(id),
    address_line1 VARCHAR(200) NOT NULL,
    address_line2 VARCHAR(200),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country_code CHAR(2) NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    geolocation GEOGRAPHY(POINT), -- PostGIS extension
    timezone VARCHAR(50),
    opening_hours JSONB,
    contact_name VARCHAR(100),
    contact_phone VARCHAR(30),
    contact_email VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'temporary'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: users

Stocke les utilisateurs du système.

```
users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    partner_id INTEGER REFERENCES partners(id),
    site_id INTEGER REFERENCES sites(id),
    department VARCHAR(100),
    position VARCHAR(100),
    phone VARCHAR(30),
    mobile VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'pending', 'blocked'
    last_login_at TIMESTAMP,
    password_changed_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: roles

Stocke les rôles utilisateur pour le contrôle d'accès.

```
roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: user_roles

Table de jointure entre utilisateurs et rôles.

```
user_roles (
    user_id INTEGER NOT NULL REFERENCES users(id),
    role_id INTEGER NOT NULL REFERENCES roles(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
)
```

#### Table: permissions

Stocke les permissions individuelles.

```
permissions (
    id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource_type VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'read', 'write', 'delete', 'execute', etc.
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: role_permissions

Table de jointure entre rôles et permissions.

```
role_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(id),
    permission_id INTEGER NOT NULL REFERENCES permissions(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
)
```

### 2. Commandes et Expéditions

#### Table: orders

Stocke les commandes de transport.

```
orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL REFERENCES partners(id),
    customer_reference VARCHAR(100),
    order_type VARCHAR(50) NOT NULL, -- 'standard', 'express', 'return', etc.
    status VARCHAR(50) NOT NULL, -- 'draft', 'confirmed', 'in_progress', 'completed', 'cancelled', etc.
    priority INTEGER DEFAULT 3, -- 1 (highest) to 5 (lowest)
    origin_site_id INTEGER REFERENCES sites(id),
    origin_address_id INTEGER REFERENCES partner_addresses(id),
    destination_site_id INTEGER REFERENCES sites(id),
    destination_address_id INTEGER REFERENCES partner_addresses(id),
    requested_pickup_date DATE,
    requested_pickup_time_window TSRANGE,
    requested_delivery_date DATE,
    requested_delivery_time_window TSRANGE,
    service_level VARCHAR(50), -- 'standard', 'express', 'same_day', etc.
    incoterm VARCHAR(3), -- 'EXW', 'FCA', 'CPT', etc.
    total_weight DECIMAL(10,2),
    weight_unit VARCHAR(10), -- 'kg', 'lb', etc.
    total_volume DECIMAL(10,2),
    volume_unit VARCHAR(10), -- 'm3', 'ft3', etc.
    total_value DECIMAL(12,2),
    currency_code CHAR(3),
    insurance_required BOOLEAN DEFAULT false,
    hazardous_materials BOOLEAN DEFAULT false,
    temperature_controlled BOOLEAN DEFAULT false,
    min_temperature DECIMAL(5,2),
    max_temperature DECIMAL(5,2),
    temperature_unit VARCHAR(2), -- 'C', 'F'
    special_instructions TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
)
```

#### Table: order_items

Stocke les lignes de commande.

```
order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    item_reference VARCHAR(100),
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    packaging_type VARCHAR(50), -- 'pallet', 'box', 'container', etc.
    weight DECIMAL(10,2),
    weight_unit VARCHAR(10), -- 'kg', 'lb', etc.
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    dimension_unit VARCHAR(10), -- 'm', 'cm', 'in', etc.
    volume DECIMAL(10,2),
    volume_unit VARCHAR(10), -- 'm3', 'ft3', etc.
    value DECIMAL(12,2),
    currency_code CHAR(3),
    hazardous_class VARCHAR(10),
    un_number VARCHAR(10),
    temperature_controlled BOOLEAN DEFAULT false,
    min_temperature DECIMAL(5,2),
    max_temperature DECIMAL(5,2),
    temperature_unit VARCHAR(2), -- 'C', 'F'
    stackable BOOLEAN DEFAULT true,
    barcode VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: shipments

Stocke les expéditions.

```
shipments (
    id SERIAL PRIMARY KEY,
    shipment_number VARCHAR(50) UNIQUE NOT NULL,
    order_id INTEGER REFERENCES orders(id),
    carrier_id INTEGER REFERENCES partners(id),
    carrier_reference VARCHAR(100),
    status VARCHAR(50) NOT NULL, -- 'planned', 'in_transit', 'delivered', 'exception', etc.
    origin_site_id INTEGER REFERENCES sites(id),
    origin_address_id INTEGER REFERENCES partner_addresses(id),
    destination_site_id INTEGER REFERENCES sites(id),
    destination_address_id INTEGER REFERENCES partner_addresses(id),
    planned_pickup_date DATE,
    planned_pickup_time_window TSRANGE,
    actual_pickup_datetime TIMESTAMP,
    planned_delivery_date DATE,
    planned_delivery_time_window TSRANGE,
    actual_delivery_datetime TIMESTAMP,
    estimated_transit_time INTEGER, -- in hours
    transport_mode VARCHAR(50), -- 'road', 'air', 'sea', 'rail', 'multimodal'
    service_level VARCHAR(50), -- 'standard', 'express', 'same_day', etc.
    tracking_number VARCHAR(100),
    tracking_url TEXT,
    total_distance DECIMAL(10,2),
    distance_unit VARCHAR(10), -- 'km', 'mi', etc.
    total_cost DECIMAL(12,2),
    cost_currency CHAR(3),
    carbon_emissions DECIMAL(10,2), -- in kg CO2e
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
)
```

#### Table: shipment_items

Table de jointure entre expéditions et articles.

```
shipment_items (
    shipment_id INTEGER NOT NULL REFERENCES shipments(id),
    order_item_id INTEGER NOT NULL REFERENCES order_items(id),
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (shipment_id, order_item_id)
)
```

#### Table: routes

Stocke les tournées de livraison.

```
routes (
    id SERIAL PRIMARY KEY,
    route_number VARCHAR(50) UNIQUE NOT NULL,
    route_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'planned', 'in_progress', 'completed', 'cancelled', etc.
    carrier_id INTEGER REFERENCES partners(id),
    driver_id INTEGER REFERENCES drivers(id),
    vehicle_id INTEGER REFERENCES vehicles(id),
    start_site_id INTEGER REFERENCES sites(id),
    end_site_id INTEGER REFERENCES sites(id),
    planned_start_time TIMESTAMP,
    actual_start_time TIMESTAMP,
    planned_end_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    total_distance DECIMAL(10,2),
    distance_unit VARCHAR(10), -- 'km', 'mi', etc.
    total_duration INTEGER, -- in minutes
    total_stops INTEGER,
    total_weight DECIMAL(10,2),
    weight_unit VARCHAR(10), -- 'kg', 'lb', etc.
    total_volume DECIMAL(10,2),
    volume_unit VARCHAR(10), -- 'm3', 'ft3', etc.
    vehicle_fill_rate DECIMAL(5,2), -- percentage
    total_cost DECIMAL(12,2),
    cost_currency CHAR(3),
    carbon_emissions DECIMAL(10,2), -- in kg CO2e
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
)
```

#### Table: route_stops

Stocke les arrêts d'une tournée.

```
route_stops (
    id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL REFERENCES routes(id),
    stop_number INTEGER NOT NULL,
    stop_type VARCHAR(50) NOT NULL, -- 'pickup', 'delivery', 'break', 'refuel', etc.
    shipment_id INTEGER REFERENCES shipments(id),
    site_id INTEGER REFERENCES sites(id),
    address_id INTEGER REFERENCES partner_addresses(id),
    planned_arrival_time TIMESTAMP,
    actual_arrival_time TIMESTAMP,
    planned_departure_time TIMESTAMP,
    actual_departure_time TIMESTAMP,
    planned_service_time INTEGER, -- in minutes
    actual_service_time INTEGER, -- in minutes
    status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'skipped', 'failed', etc.
    distance_from_previous DECIMAL(10,2),
    distance_unit VARCHAR(10), -- 'km', 'mi', etc.
    special_instructions TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: shipment_status_history

Stocke l'historique des statuts d'expédition.

```
shipment_status_history (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER NOT NULL REFERENCES shipments(id),
    status VARCHAR(50) NOT NULL,
    status_datetime TIMESTAMP NOT NULL,
    location_description VARCHAR(200),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: documents

Stocke les documents associés aux commandes et expéditions.

```
documents (
    id SERIAL PRIMARY KEY,
    document_type VARCHAR(50) NOT NULL, -- 'bill_of_lading', 'delivery_note', 'cmr', 'invoice', etc.
    document_number VARCHAR(100),
    reference_type VARCHAR(50) NOT NULL, -- 'order', 'shipment', 'route', etc.
    reference_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    is_signed BOOLEAN DEFAULT false,
    status VARCHAR(50) NOT NULL, -- 'draft', 'final', 'cancelled', etc.
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
)
```

#### Table: incidents

Stocke les incidents et exceptions.

```
incidents (
    id SERIAL PRIMARY KEY,
    incident_number VARCHAR(50) UNIQUE NOT NULL,
    incident_type VARCHAR(50) NOT NULL, -- 'delay', 'damage', 'loss', 'accident', etc.
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(50) NOT NULL, -- 'open', 'in_progress', 'resolved', 'closed', etc.
    reference_type VARCHAR(50) NOT NULL, -- 'order', 'shipment', 'route', etc.
    reference_id INTEGER NOT NULL,
    reported_datetime TIMESTAMP NOT NULL,
    reported_by INTEGER REFERENCES users(id),
    description TEXT NOT NULL,
    root_cause TEXT,
    resolution TEXT,
    resolved_datetime TIMESTAMP,
    resolved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

### 3. Coûts et Facturation

#### Table: rate_cards

Stocke les grilles tarifaires.

```
rate_cards (
    id SERIAL PRIMARY KEY,
    rate_card_name VARCHAR(200) NOT NULL,
    partner_id INTEGER REFERENCES partners(id),
    transport_mode VARCHAR(50), -- 'road', 'air', 'sea', 'rail', 'multimodal'
    service_level VARCHAR(50), -- 'standard', 'express', 'same_day', etc.
    origin_zone VARCHAR(100), -- can be country, region, postal code range, etc.
    destination_zone VARCHAR(100),
    currency_code CHAR(3) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'draft'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
)
```

#### Table: rate_items

Stocke les lignes de tarif.

```
rate_items (
    id SERIAL PRIMARY KEY,
    rate_card_id INTEGER NOT NULL REFERENCES rate_cards(id),
    service_code VARCHAR(50),
    charge_type VARCHAR(50) NOT NULL, -- 'base', 'fuel_surcharge', 'handling', 'insurance', etc.
    calculation_basis VARCHAR(50) NOT NULL, -- 'per_shipment', 'per_kg', 'per_km', 'per_cbm', 'percentage', etc.
    min_value DECIMAL(10,2),
    max_value DECIMAL(10,2),
    unit_price DECIMAL(12,4) NOT NULL,
    minimum_charge DECIMAL(12,2),
    maximum_charge DECIMAL(12,2),
    conditions JSONB, -- for complex conditions
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: cost_centers

Stocke les centres de coûts.

```
cost_centers (
    id SERIAL PRIMARY KEY,
    cost_center_code VARCHAR(50) UNIQUE NOT NULL,
    cost_center_name VARCHAR(200) NOT NULL,
    parent_id INTEGER REFERENCES cost_centers(id),
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: invoices

Stocke les factures.

```
invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_type VARCHAR(50) NOT NULL, -- 'customer', 'carrier', 'service_provider', etc.
    partner_id INTEGER NOT NULL REFERENCES partners(id),
    status VARCHAR(50) NOT NULL, -- 'draft', 'issued', 'paid', 'cancelled', etc.
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_terms VARCHAR(100),
    currency_code CHAR(3) NOT NULL,
    subtotal_amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    payment_date DATE,
    payment_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
)
```

#### Table: invoice_lines

Stocke les lignes de facture.

```
invoice_lines (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id),
    line_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    reference_type VARCHAR(50), -- 'order', 'shipment', 'route', etc.
    reference_id INTEGER,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(12,4) NOT NULL,
    unit_of_measure VARCHAR(50),
    tax_rate DECIMAL(5,2),
    tax_amount DECIMAL(12,2),
    line_amount DECIMAL(12,2) NOT NULL,
    cost_center_id INTEGER REFERENCES cost_centers(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: payment_transactions

Stocke les transactions de paiement.

```
payment_transactions (
    id SERIAL PRIMARY KEY,
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'payment', 'refund', 'adjustment', etc.
    invoice_id INTEGER REFERENCES invoices(id),
    partner_id INTEGER NOT NULL REFERENCES partners(id),
    amount DECIMAL(12,2) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'bank_transfer', 'credit_card', 'check', etc.
    payment_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed', 'cancelled', etc.
    payment_details JSONB,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
)
```

### 4. Flotte et Ressources

#### Table: vehicles

Stocke les véhicules.

```
vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_code VARCHAR(50) UNIQUE NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    partner_id INTEGER REFERENCES partners(id),
    vehicle_type VARCHAR(50) NOT NULL, -- 'truck', 'van', 'trailer', etc.
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    vin VARCHAR(50),
    status VARCHAR(50) NOT NULL, -- 'active', 'maintenance', 'out_of_service', 'retired', etc.
    capacity_weight DECIMAL(10,2),
    weight_unit VARCHAR(10), -- 'kg', 'lb', etc.
    capacity_volume DECIMAL(10,2),
    volume_unit VARCHAR(10), -- 'm3', 'ft3', etc.
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    dimension_unit VARCHAR(10), -- 'm', 'cm', 'in', etc.
    max_pallets INTEGER,
    fuel_type VARCHAR(50), -- 'diesel', 'gasoline', 'electric', 'hybrid', etc.
    fuel_capacity DECIMAL(10,2),
    fuel_unit VARCHAR(10), -- 'l', 'gal', etc.
    average_consumption DECIMAL(10,2), -- per 100km or per mile
    emissions_class VARCHAR(50), -- 'EURO6', 'EPA2010', etc.
    telematics_device_id VARCHAR(100),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    next_maintenance_km DECIMAL(10,2),
    purchase_date DATE,
    purchase_cost DECIMAL(12,2),
    currency_code CHAR(3),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: drivers

Stocke les conducteurs.

```
drivers (
    id SERIAL PRIMARY KEY,
    driver_code VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    partner_id INTEGER REFERENCES partners(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(30),
    mobile VARCHAR(30) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    license_type VARCHAR(50) NOT NULL,
    license_expiry_date DATE NOT NULL,
    hazmat_certified BOOLEAN DEFAULT false,
    adr_certification VARCHAR(50),
    adr_expiry_date DATE,
    status VARCHAR(50) NOT NULL, -- 'active', 'inactive', 'on_leave', etc.
    home_address_id INTEGER REFERENCES partner_addresses(id),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: driver_availability

Stocke la disponibilité des conducteurs.

```
driver_availability (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL REFERENCES drivers(id),
    availability_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'available', 'unavailable', 'tentative', etc.
    reason VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: driver_qualifications

Stocke les qualifications des conducteurs.

```
driver_qualifications (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL REFERENCES drivers(id),
    qualification_type VARCHAR(100) NOT NULL, -- 'license_type', 'certification', 'training', etc.
    qualification_name VARCHAR(200) NOT NULL,
    issuing_authority VARCHAR(200),
    reference_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    status VARCHAR(50) NOT NULL, -- 'active', 'expired', 'revoked', etc.
    document_id INTEGER REFERENCES documents(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: equipment

Stocke les équipements.

```
equipment (
    id SERIAL PRIMARY KEY,
    equipment_code VARCHAR(50) UNIQUE NOT NULL,
    equipment_type VARCHAR(50) NOT NULL, -- 'trailer', 'container', 'pallet_jack', 'forklift', etc.
    description VARCHAR(200) NOT NULL,
    serial_number VARCHAR(100),
    partner_id INTEGER REFERENCES partners(id),
    site_id INTEGER REFERENCES sites(id),
    status VARCHAR(50) NOT NULL, -- 'available', 'in_use', 'maintenance', 'out_of_service', etc.
    capacity DECIMAL(10,2),
    capacity_unit VARCHAR(10),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    purchase_date DATE,
    purchase_cost DECIMAL(12,2),
    currency_code CHAR(3),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: maintenance_records

Stocke les enregistrements de maintenance.

```
maintenance_records (
    id SERIAL PRIMARY KEY,
    record_type VARCHAR(50) NOT NULL, -- 'vehicle', 'equipment'
    reference_id INTEGER NOT NULL, -- vehicle_id or equipment_id
    maintenance_type VARCHAR(50) NOT NULL, -- 'preventive', 'corrective', 'inspection', etc.
    description TEXT NOT NULL,
    service_provider VARCHAR(200),
    start_date DATE NOT NULL,
    completion_date DATE,
    odometer_reading DECIMAL(10,2),
    cost DECIMAL(12,2),
    currency_code CHAR(3),
    status VARCHAR(50) NOT NULL, -- 'planned', 'in_progress', 'completed', 'cancelled', etc.
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
)
```

### 5. Analyse et Reporting

#### Table: kpi_definitions

Stocke les définitions des indicateurs clés de performance.

```
kpi_definitions (
    id SERIAL PRIMARY KEY,
    kpi_code VARCHAR(50) UNIQUE NOT NULL,
    kpi_name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'operational', 'financial', 'quality', 'environmental', etc.
    calculation_formula TEXT,
    unit_of_measure VARCHAR(50),
    target_value DECIMAL(10,2),
    min_threshold DECIMAL(10,2),
    max_threshold DECIMAL(10,2),
    is_higher_better BOOLEAN NOT NULL,
    display_order INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: kpi_values

Stocke les valeurs des KPIs.

```
kpi_values (
    id SERIAL PRIMARY KEY,
    kpi_id INTEGER NOT NULL REFERENCES kpi_definitions(id),
    reference_type VARCHAR(50), -- 'global', 'partner', 'site', 'route', etc.
    reference_id INTEGER,
    period_type VARCHAR(20) NOT NULL, -- 'day', 'week', 'month', 'quarter', 'year'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    kpi_value DECIMAL(15,4) NOT NULL,
    target_value DECIMAL(15,4),
    previous_value DECIMAL(15,4),
    trend_percentage DECIMAL(8,2),
    status VARCHAR(20) NOT NULL, -- 'actual', 'estimated', 'projected'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: reports

Stocke les définitions de rapports.

```
reports (
    id SERIAL PRIMARY KEY,
    report_code VARCHAR(50) UNIQUE NOT NULL,
    report_name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'operational', 'financial', 'analytical', 'client', etc.
    report_type VARCHAR(50) NOT NULL, -- 'standard', 'custom', 'dashboard', etc.
    template_path VARCHAR(255),
    parameters JSONB,
    schedule_type VARCHAR(50), -- 'manual', 'daily', 'weekly', 'monthly', etc.
    schedule_details JSONB,
    last_generated_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'draft'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
)
```

#### Table: report_subscriptions

Stocke les abonnements aux rapports.

```
report_subscriptions (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    delivery_method VARCHAR(50) NOT NULL, -- 'email', 'portal', 'api', etc.
    delivery_details JSONB, -- email address, API endpoint, etc.
    format VARCHAR(20) NOT NULL, -- 'pdf', 'excel', 'csv', 'html', etc.
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: dashboards

Stocke les configurations de tableaux de bord.

```
dashboards (
    id SERIAL PRIMARY KEY,
    dashboard_name VARCHAR(200) NOT NULL,
    description TEXT,
    layout JSONB NOT NULL, -- structure and layout of widgets
    is_system BOOLEAN NOT NULL DEFAULT false,
    is_public BOOLEAN NOT NULL DEFAULT false,
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: dashboard_widgets

Stocke les widgets des tableaux de bord.

```
dashboard_widgets (
    id SERIAL PRIMARY KEY,
    dashboard_id INTEGER NOT NULL REFERENCES dashboards(id),
    widget_type VARCHAR(50) NOT NULL, -- 'chart', 'kpi', 'table', 'map', etc.
    widget_title VARCHAR(200) NOT NULL,
    widget_config JSONB NOT NULL, -- configuration specific to widget type
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

### 6. Intégration et Connectivité

#### Table: integration_endpoints

Stocke les points d'intégration.

```
integration_endpoints (
    id SERIAL PRIMARY KEY,
    endpoint_name VARCHAR(200) NOT NULL,
    endpoint_type VARCHAR(50) NOT NULL, -- 'api', 'edi', 'file', 'database', etc.
    direction VARCHAR(20) NOT NULL, -- 'inbound', 'outbound', 'bidirectional'
    partner_id INTEGER REFERENCES partners(id),
    connection_details JSONB NOT NULL, -- URLs, credentials (encrypted), protocols, etc.
    data_format VARCHAR(50), -- 'json', 'xml', 'csv', 'edifact', 'x12', etc.
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'testing'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: data_mappings

Stocke les mappings de données pour les intégrations.

```
data_mappings (
    id SERIAL PRIMARY KEY,
    integration_endpoint_id INTEGER NOT NULL REFERENCES integration_endpoints(id),
    mapping_name VARCHAR(200) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'order', 'shipment', 'partner', etc.
    mapping_direction VARCHAR(20) NOT NULL, -- 'import', 'export'
    mapping_rules JSONB NOT NULL, -- field mappings, transformations, validations
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: integration_logs

Stocke les logs d'intégration.

```
integration_logs (
    id SERIAL PRIMARY KEY,
    integration_endpoint_id INTEGER NOT NULL REFERENCES integration_endpoints(id),
    transaction_id VARCHAR(100) NOT NULL,
    direction VARCHAR(20) NOT NULL, -- 'inbound', 'outbound'
    entity_type VARCHAR(50), -- 'order', 'shipment', 'partner', etc.
    entity_id INTEGER,
    status VARCHAR(50) NOT NULL, -- 'success', 'error', 'warning', 'pending'
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    request_data TEXT,
    response_data TEXT,
    error_message TEXT,
    processing_time INTEGER, -- in milliseconds
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: api_keys

Stocke les clés API pour l'accès externe.

```
api_keys (
    id SERIAL PRIMARY KEY,
    api_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    partner_id INTEGER REFERENCES partners(id),
    user_id INTEGER REFERENCES users(id),
    permissions JSONB, -- specific permissions for this key
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
)
```

#### Table: webhooks

Stocke les configurations de webhooks.

```
webhooks (
    id SERIAL PRIMARY KEY,
    webhook_name VARCHAR(200) NOT NULL,
    partner_id INTEGER REFERENCES partners(id),
    event_types VARCHAR[] NOT NULL, -- array of event types to trigger this webhook
    target_url TEXT NOT NULL,
    http_method VARCHAR(10) NOT NULL DEFAULT 'POST',
    headers JSONB,
    payload_template TEXT,
    secret_key VARCHAR(255), -- for signature verification
    is_active BOOLEAN NOT NULL DEFAULT true,
    failure_count INTEGER NOT NULL DEFAULT 0,
    last_triggered_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: webhook_logs

Stocke les logs d'exécution des webhooks.

```
webhook_logs (
    id SERIAL PRIMARY KEY,
    webhook_id INTEGER NOT NULL REFERENCES webhooks(id),
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- 'order', 'shipment', 'partner', etc.
    entity_id INTEGER,
    payload TEXT,
    response_code INTEGER,
    response_body TEXT,
    execution_time INTEGER, -- in milliseconds
    status VARCHAR(20) NOT NULL, -- 'success', 'error', 'retry'
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

### 7. Administration et Configuration

#### Table: system_parameters

Stocke les paramètres système globaux.

```
system_parameters (
    id SERIAL PRIMARY KEY,
    parameter_key VARCHAR(100) UNIQUE NOT NULL,
    parameter_value TEXT,
    data_type VARCHAR(50) NOT NULL, -- 'string', 'integer', 'boolean', 'json', etc.
    description TEXT,
    is_sensitive BOOLEAN NOT NULL DEFAULT false,
    is_editable BOOLEAN NOT NULL DEFAULT true,
    category VARCHAR(100) NOT NULL, -- 'general', 'security', 'notification', 'integration', etc.
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
)
```

#### Table: tenant_parameters

Stocke les paramètres spécifiques à chaque tenant.

```
tenant_parameters (
    id SERIAL PRIMARY KEY,
    parameter_key VARCHAR(100) NOT NULL,
    parameter_value TEXT,
    data_type VARCHAR(50) NOT NULL, -- 'string', 'integer', 'boolean', 'json', etc.
    description TEXT,
    is_sensitive BOOLEAN NOT NULL DEFAULT false,
    is_editable BOOLEAN NOT NULL DEFAULT true,
    category VARCHAR(100) NOT NULL, -- 'general', 'security', 'notification', 'integration', etc.
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id),
    UNIQUE(parameter_key) -- Unique within each tenant schema
)
```

#### Table: reference_data

Stocke les données de référence.

```
reference_data (
    id SERIAL PRIMARY KEY,
    reference_type VARCHAR(100) NOT NULL, -- 'country', 'currency', 'uom', 'vehicle_type', etc.
    reference_code VARCHAR(50) NOT NULL,
    reference_value VARCHAR(200) NOT NULL,
    description TEXT,
    parent_code VARCHAR(50), -- for hierarchical reference data
    display_order INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    additional_data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reference_type, reference_code)
)
```

#### Table: document_templates

Stocke les modèles de documents.

```
document_templates (
    id SERIAL PRIMARY KEY,
    template_code VARCHAR(50) UNIQUE NOT NULL,
    template_name VARCHAR(200) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- 'invoice', 'delivery_note', 'label', etc.
    description TEXT,
    template_format VARCHAR(20) NOT NULL, -- 'html', 'docx', 'pdf', 'zpl', etc.
    template_content TEXT NOT NULL,
    css_content TEXT,
    script_content TEXT,
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    is_default BOOLEAN NOT NULL DEFAULT false,
    partner_id INTEGER REFERENCES partners(id), -- NULL for system templates
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'draft'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
)
```

#### Table: audit_logs

Stocke les logs d'audit pour la traçabilité.

```
audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'login', 'export', etc.
    entity_type VARCHAR(100) NOT NULL, -- 'user', 'order', 'shipment', 'partner', etc.
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    action_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: notifications

Stocke les notifications système.

```
notifications (
    id SERIAL PRIMARY KEY,
    notification_type VARCHAR(50) NOT NULL, -- 'alert', 'info', 'task', 'system', etc.
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
    reference_type VARCHAR(50), -- 'order', 'shipment', 'incident', etc.
    reference_id INTEGER,
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_actionable BOOLEAN NOT NULL DEFAULT false,
    action_url TEXT,
    recipient_id INTEGER NOT NULL REFERENCES users(id),
    expiry_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: scheduled_tasks

Stocke les tâches planifiées.

```
scheduled_tasks (
    id SERIAL PRIMARY KEY,
    task_name VARCHAR(200) NOT NULL,
    task_type VARCHAR(50) NOT NULL, -- 'report', 'integration', 'maintenance', 'notification', etc.
    description TEXT,
    cron_expression VARCHAR(100) NOT NULL,
    parameters JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    last_run_status VARCHAR(20), -- 'success', 'error', 'warning', 'skipped'
    last_run_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

## Schéma Public (Tables Partagées)

Ces tables sont stockées dans le schéma `public` et sont partagées entre tous les tenants.

#### Table: tenants

Stocke les informations sur les tenants (clients SaaS).

```
tenants (
    id SERIAL PRIMARY KEY,
    tenant_code VARCHAR(50) UNIQUE NOT NULL,
    schema_name VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    subscription_plan VARCHAR(50) NOT NULL, -- 'basic', 'professional', 'enterprise', etc.
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'suspended', 'trial'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trial_ends_at TIMESTAMP,
    subscription_ends_at TIMESTAMP
)
```

#### Table: tenant_domains

Stocke les domaines personnalisés pour chaque tenant.

```
tenant_domains (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    domain VARCHAR(255) UNIQUE NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'failed'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### Table: tenant_admins

Stocke les administrateurs de chaque tenant.

```
tenant_admins (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    email VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive'
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

## Index et Contraintes

Pour optimiser les performances, de nombreux index seront créés sur les colonnes fréquemment utilisées dans les requêtes. Voici quelques exemples d'index importants :

```sql
-- Index pour les recherches fréquentes
CREATE INDEX idx_partners_partner_code ON partners(partner_code);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_shipments_shipment_number ON shipments(shipment_number);
CREATE INDEX idx_routes_route_number ON routes(route_number);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

-- Index pour les jointures fréquentes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX idx_route_stops_shipment_id ON route_stops(shipment_id);
CREATE INDEX idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);

-- Index pour les recherches par date
CREATE INDEX idx_orders_requested_delivery_date ON orders(requested_delivery_date);
CREATE INDEX idx_shipments_planned_delivery_date ON shipments(planned_delivery_date);
CREATE INDEX idx_routes_route_date ON routes(route_date);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);

-- Index pour les recherches géospatiales
CREATE INDEX idx_sites_geolocation ON sites USING GIST(geolocation);
CREATE INDEX idx_partner_addresses_geolocation ON partner_addresses USING GIST(geolocation);

-- Index pour les recherches par statut
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_invoices_status ON invoices(status);
```

Des contraintes de clé étrangère sont définies pour maintenir l'intégrité référentielle entre les tables. Des contraintes de vérification (CHECK) seront également ajoutées pour garantir la validité des données (par exemple, pour s'assurer que les dates de livraison sont postérieures aux dates d'enlèvement).

## Stratégies de Partitionnement

Pour les tables susceptibles de contenir un grand volume de données, des stratégies de partitionnement seront mises en place :

1. **Partitionnement par plage de dates** pour les tables historiques comme `shipment_status_history`, `audit_logs`, et `integration_logs`.

2. **Partitionnement par liste** pour les tables avec une distribution naturelle comme `orders` et `shipments` (par statut ou par région).

3. **Partitionnement par hachage** pour les tables sans distribution naturelle évidente mais nécessitant une répartition équilibrée de la charge.

## Conclusion

Ce schéma de base de données est conçu pour offrir une fondation solide au TMS, avec une attention particulière à la performance, la scalabilité et la flexibilité. L'approche multi-tenant par schéma permet une isolation efficace des données tout en maintenant la capacité de partager des ressources et d'effectuer des analyses globales lorsque nécessaire.

La structure modulaire du schéma, organisée par groupes fonctionnels, facilite la maintenance et l'évolution du système au fil du temps. Les relations entre les entités sont clairement définies, permettant des requêtes complexes tout en maintenant l'intégrité des données.

Ce schéma sera complété par des procédures stockées, des déclencheurs et des vues pour implémenter des logiques métier complexes et optimiser les requêtes fréquentes.
