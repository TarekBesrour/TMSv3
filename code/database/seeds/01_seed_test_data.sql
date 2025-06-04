-- Script SQL pour insérer des données de test dans le TMS
-- À exécuter après avoir créé les tables principales

-- Insertion dans le schéma partagé
SET search_path TO shared;

-- Insertion des tenants de test
INSERT INTO tenants (name, subdomain, status, subscription_plan, contact_email, max_users, settings)
VALUES 
('Transport Express', 'transport-express', 'active', 'premium', 'admin@transport-express.com', 20, '{"theme": "blue", "features": {"ai_assistant": true, "predictive_maintenance": true, "document_processing": true}}'),
('Logistique Pro', 'logistique-pro', 'active', 'standard', 'contact@logistique-pro.com', 10, '{"theme": "green", "features": {"ai_assistant": true, "predictive_maintenance": false, "document_processing": true}}'),
('Demo Company', 'demo', 'active', 'trial', 'demo@example.com', 5, '{"theme": "default", "features": {"ai_assistant": true, "predictive_maintenance": true, "document_processing": true}}');

-- Insertion des administrateurs système
INSERT INTO system_users (email, password_hash, first_name, last_name, role)
VALUES 
('admin@tms-saas.com', '$2a$10$XgXLGQHSGD8xA4TKcKDjZOIl0nUmrOPNgx.qUBFU5iMT9nnQgwSOy', 'Admin', 'System', 'super_admin'),
('support@tms-saas.com', '$2a$10$hKUzUCGMNnxvAA7BhAhB8.8l0WmQnF0Uy.J4R0tg2X2pjDGtVMIXi', 'Support', 'Team', 'support');

-- Insertion des modèles IA
INSERT INTO ai_models (name, version, type, description, status, configuration, metrics)
VALUES 
('Assistant TMS', '1.0.0', 'nlp', 'Modèle de traitement du langage naturel pour l''assistant virtuel', 'active', 
 '{"engine": "transformer", "parameters": {"temperature": 0.7, "max_tokens": 1024}}',
 '{"accuracy": 0.92, "latency_ms": 120}'),
('Prédiction Demande', '1.0.0', 'forecasting', 'Modèle de prévision de la demande de transport', 'active', 
 '{"engine": "prophet", "parameters": {"seasonality_mode": "multiplicative", "changepoint_prior_scale": 0.05}}',
 '{"mape": 0.08, "rmse": 12.5}'),
('Maintenance Prédictive', '1.0.0', 'anomaly_detection', 'Modèle de détection d''anomalies pour la maintenance prédictive', 'active', 
 '{"engine": "isolation_forest", "parameters": {"contamination": 0.01, "n_estimators": 100}}',
 '{"precision": 0.89, "recall": 0.92}'),
('Optimisation Tournées', '1.0.0', 'optimization', 'Modèle d''optimisation multi-objectifs des tournées', 'active', 
 '{"engine": "genetic_algorithm", "parameters": {"population_size": 100, "mutation_rate": 0.1, "crossover_rate": 0.8}}',
 '{"cost_reduction": 0.15, "co2_reduction": 0.12}'),
('Traitement Documents', '1.0.0', 'ocr', 'Modèle d''extraction d''informations des documents de transport', 'active', 
 '{"engine": "transformer_ocr", "parameters": {"confidence_threshold": 0.8}}',
 '{"accuracy": 0.94, "processing_time_s": 2.3}');

-- Fonction pour insérer des données de test dans un schéma tenant
CREATE OR REPLACE FUNCTION populate_tenant_data(tenant_id INTEGER) 
RETURNS VOID AS $$
DECLARE
    schema_name TEXT;
BEGIN
    -- Définir le nom du schéma
    schema_name := 'tenant_' || tenant_id;
    
    -- Définir le search_path pour insérer les données dans ce schéma
    EXECUTE 'SET search_path TO ' || schema_name;
    
    -- Insertion des utilisateurs
    EXECUTE '
    INSERT INTO users (email, password_hash, first_name, last_name, role, status)
    VALUES 
    (''admin@tenant' || tenant_id || '.com'', ''$2a$10$XgXLGQHSGD8xA4TKcKDjZOIl0nUmrOPNgx.qUBFU5iMT9nnQgwSOy'', ''Admin'', ''User'', ''admin'', ''active''),
    (''manager@tenant' || tenant_id || '.com'', ''$2a$10$hKUzUCGMNnxvAA7BhAhB8.8l0WmQnF0Uy.J4R0tg2X2pjDGtVMIXi'', ''Transport'', ''Manager'', ''manager'', ''active''),
    (''planner@tenant' || tenant_id || '.com'', ''$2a$10$hKUzUCGMNnxvAA7BhAhB8.8l0WmQnF0Uy.J4R0tg2X2pjDGtVMIXi'', ''Planning'', ''User'', ''planner'', ''active''),
    (''fleet@tenant' || tenant_id || '.com'', ''$2a$10$hKUzUCGMNnxvAA7BhAhB8.8l0WmQnF0Uy.J4R0tg2X2pjDGtVMIXi'', ''Fleet'', ''Manager'', ''fleet_manager'', ''active''),
    (''finance@tenant' || tenant_id || '.com'', ''$2a$10$hKUzUCGMNnxvAA7BhAhB8.8l0WmQnF0Uy.J4R0tg2X2pjDGtVMIXi'', ''Finance'', ''User'', ''finance'', ''active'')
    ';
    
    -- Insertion des rôles
    EXECUTE '
    INSERT INTO roles (name, description, permissions)
    VALUES 
    (''admin'', ''Administrateur avec accès complet'', ''{"all": true}''),
    (''manager'', ''Gestionnaire de transport'', ''{"orders": {"read": true, "write": true}, "shipments": {"read": true, "write": true}, "routes": {"read": true, "write": true}, "clients": {"read": true, "write": true}, "carriers": {"read": true, "write": true}, "reports": {"read": true}}''),
    (''planner'', ''Planificateur de transport'', ''{"orders": {"read": true, "write": true}, "shipments": {"read": true, "write": true}, "routes": {"read": true, "write": true}, "clients": {"read": true}, "carriers": {"read": true}}''),
    (''fleet_manager'', ''Gestionnaire de flotte'', ''{"vehicles": {"read": true, "write": true}, "drivers": {"read": true, "write": true}, "maintenance": {"read": true, "write": true}, "telematic": {"read": true}}''),
    (''finance'', ''Utilisateur finance'', ''{"invoices": {"read": true, "write": true}, "rates": {"read": true, "write": true}, "reports": {"read": true}}''),
    (''client'', ''Client externe'', ''{"orders": {"read": true, "write": true}, "shipments": {"read": true}, "documents": {"read": true}, "invoices": {"read": true}}'')'
    ';
    
    -- Insertion des clients
    EXECUTE '
    INSERT INTO clients (name, code, address, city, postal_code, country, contact_name, contact_email, contact_phone, status, category)
    VALUES 
    (''Électronique Plus'', ''ELEC001'', ''123 Rue de l''Innovation'', ''Paris'', ''75001'', ''France'', ''Jean Dupont'', ''contact@electronique-plus.fr'', ''+33123456789'', ''active'', ''Électronique''),
    (''Agro Distribution'', ''AGRO002'', ''45 Avenue des Champs'', ''Lyon'', ''69002'', ''France'', ''Marie Martin'', ''info@agrodistribution.fr'', ''+33234567890'', ''active'', ''Agroalimentaire''),
    (''MediSanté'', ''MEDI003'', ''78 Boulevard de la Santé'', ''Marseille'', ''13008'', ''France'', ''Pierre Lefebvre'', ''contact@medisante.fr'', ''+33345678901'', ''active'', ''Pharmaceutique''),
    (''Mode Express'', ''MODE004'', ''12 Rue du Commerce'', ''Bordeaux'', ''33000'', ''France'', ''Sophie Dubois'', ''info@mode-express.fr'', ''+33456789012'', ''active'', ''Textile''),
    (''BTP Constructions'', ''BTP005'', ''56 Avenue des Bâtisseurs'', ''Lille'', ''59000'', ''France'', ''Thomas Moreau'', ''contact@btp-constructions.fr'', ''+33567890123'', ''active'', ''Construction'')'
    ';
    
    -- Insertion des transporteurs
    EXECUTE '
    INSERT INTO carriers (name, code, address, city, postal_code, country, contact_name, contact_email, contact_phone, status, category, capabilities, rating)
    VALUES 
    (''Trans Express'', ''TREX001'', ''10 Rue de la Logistique'', ''Paris'', ''75010'', ''France'', ''Luc Dubois'', ''contact@trans-express.fr'', ''+33123456780'', ''active'', ''Express'', ''{"national": true, "international": true, "hazardous": false, "refrigerated": false}'', 4.8),
    (''Frigo Transport'', ''FRIG002'', ''25 Avenue du Froid'', ''Lyon'', ''69003'', ''France'', ''Emma Blanc'', ''info@frigo-transport.fr'', ''+33234567891'', ''active'', ''Frigorifique'', ''{"national": true, "international": false, "hazardous": false, "refrigerated": true}'', 4.5),
    (''Euro Logistics'', ''EURO003'', ''8 Boulevard International'', ''Strasbourg'', ''67000'', ''France'', ''Marc Leroy'', ''contact@euro-logistics.fr'', ''+33345678902'', ''active'', ''International'', ''{"national": true, "international": true, "hazardous": true, "refrigerated": false}'', 4.2),
    (''Eco Transport'', ''ECO004'', ''36 Rue Verte'', ''Nantes'', ''44000'', ''France'', ''Julie Rousseau'', ''info@eco-transport.fr'', ''+33456789013'', ''active'', ''Écologique'', ''{"national": true, "international": false, "hazardous": false, "refrigerated": false, "electric_vehicles": true}'', 4.7),
    (''Heavy Cargo'', ''HEAV005'', ''92 Avenue des Poids Lourds'', ''Toulouse'', ''31000'', ''France'', ''Antoine Mercier'', ''contact@heavy-cargo.fr'', ''+33567890124'', ''active'', ''Charges lourdes'', ''{"national": true, "international": true, "hazardous": true, "heavy_load": true}'', 4.4)'
    ';
    
    -- Insertion des sites
    EXECUTE '
    INSERT INTO sites (name, code, type, address, city, postal_code, country, latitude, longitude, contact_name, contact_email, contact_phone, opening_hours, status, client_id)
    VALUES 
    (''Entrepôt Paris'', ''EP001'', ''warehouse'', ''5 Rue de l''Entrepôt'', ''Paris'', ''75019'', ''France'', 48.8566, 2.3522, ''Responsable Entrepôt'', ''entrepot.paris@electronique-plus.fr'', ''+33123456781'', ''{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "17:00"}}'', ''active'', 1),
    (''Usine Lyon'', ''UL002'', ''factory'', ''15 Avenue de la Production'', ''Lyon'', ''69004'', ''France'', 45.7640, 4.8357, ''Responsable Usine'', ''usine.lyon@agrodistribution.fr'', ''+33234567892'', ''{"monday": {"open": "07:00", "close": "19:00"}, "tuesday": {"open": "07:00", "close": "19:00"}, "wednesday": {"open": "07:00", "close": "19:00"}, "thursday": {"open": "07:00", "close": "19:00"}, "friday": {"open": "07:00", "close": "19:00"}}'', ''active'', 2),
    (''Dépôt Marseille'', ''DM003'', ''warehouse'', ''25 Boulevard du Stockage'', ''Marseille'', ''13009'', ''France'', 43.2965, 5.3698, ''Responsable Dépôt'', ''depot.marseille@medisante.fr'', ''+33345678903'', ''{"monday": {"open": "08:30", "close": "17:30"}, "tuesday": {"open": "08:30", "close": "17:30"}, "wednesday": {"open": "08:30", "close": "17:30"}, "thursday": {"open": "08:30", "close": "17:30"}, "friday": {"open": "08:30", "close": "16:30"}}'', ''active'', 3),
    (''Centre Distribution Bordeaux'', ''CDB004'', ''distribution'', ''8 Rue de la Distribution'', ''Bordeaux'', ''33000'', ''France'', 44.8378, -0.5792, ''Responsable Distribution'', ''distribution.bordeaux@mode-express.fr'', ''+33456789014'', ''{"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}, "wednesday": {"open": "09:00", "close": "18:00"}, "thursday": {"open": "09:00", "close": "18:00"}, "friday": {"open": "09:00", "close": "18:00"}}'', ''active'', 4),
    (''Chantier Lille'', ''CL005'', ''site'', ''42 Avenue du Chantier'', ''Lille'', ''59000'', ''France'', 50.6292, 3.0573, ''Chef de Chantier'', ''chantier.lille@btp-constructions.fr'', ''+33567890125'', ''{"monday": {"open": "07:30", "close": "16:30"}, "tuesday": {"open": "07:30", "close": "16:30"}, "wednesday": {"open": "07:30", "close": "16:30"}, "thursday": {"open": "07:30", "close": "16:30"}, "friday": {"open": "07:30", "close": "15:30"}}'', ''active'', 5)'
    ';
    
    -- Insertion des véhicules
    EXECUTE '
    INSERT INTO vehicles (registration_number, type, brand, model, year, max_weight, max_volume, max_length, max_width, max_height, carrier_id, status, last_maintenance_date, next_maintenance_date)
    VALUES 
    (''AB-123-CD'', ''tractor_trailer'', ''Volvo'', ''FH16'', 2023, 40000, 90, 16.5, 2.55, 4, 1, ''active'', ''2025-04-15'', ''2025-07-15''),
    (''EF-456-GH'', ''rigid_truck'', ''Mercedes'', ''Actros'', 2022, 26000, 60, 12, 2.55, 4, 1, ''active'', ''2025-05-10'', ''2025-08-10''),
    (''IJ-789-KL'', ''refrigerated_truck'', ''Scania'', ''R450'', 2023, 26000, 55, 12, 2.55, 3.8, 2, ''active'', ''2025-03-20'', ''2025-06-20''),
    (''MN-012-OP'', ''van'', ''Renault'', ''Master'', 2024, 3500, 20, 6, 2.1, 2.8, 4, ''active'', ''2025-05-05'', ''2025-08-05''),
    (''QR-345-ST'', ''heavy_duty'', ''MAN'', ''TGX'', 2022, 60000, 120, 18, 3, 4.2, 5, ''active'', ''2025-04-25'', ''2025-07-25'')'
    ';
    
    -- Insertion des conducteurs
    EXECUTE '
    INSERT INTO drivers (first_name, last_name, email, phone, license_number, license_type, license_expiry_date, carrier_id, status, qualifications)
    VALUES 
    (''Michel'', ''Durand'', ''m.durand@trans-express.fr'', ''+33612345678'', ''12345678'', ''C+E'', ''2027-05-15'', 1, ''active'', ''{"adr": true, "eco_driving": true}''),
    (''Sophie'', ''Martin'', ''s.martin@trans-express.fr'', ''+33623456789'', ''23456789'', ''C'', ''2026-08-20'', 1, ''active'', ''{"adr": false, "eco_driving": true}''),
    (''Laurent'', ''Petit'', ''l.petit@frigo-transport.fr'', ''+33634567890'', ''34567890'', ''C+E'', ''2028-03-10'', 2, ''active'', ''{"refrigerated": true, "long_distance": true}''),
    (''Camille'', ''Dubois'', ''c.dubois@eco-transport.fr'', ''+33645678901'', ''45678901'', ''C'', ''2026-11-05'', 4, ''active'', ''{"electric_vehicles": true, "city_delivery": true}''),
    (''Thomas'', ''Leroy'', ''t.leroy@heavy-cargo.fr'', ''+33656789012'', ''56789012'', ''C+E'', ''2027-09-30'', 5, ''active'', ''{"heavy_load": true, "special_transport": true, "adr": true}'')'
    ';
    
    -- Insertion des commandes
    EXECUTE '
    INSERT INTO orders (reference, client_id, origin_site_id, destination_site_id, requested_pickup_date, requested_delivery_date, status, priority, total_weight, total_volume, package_count, special_instructions)
    VALUES 
    (''ORD-2025-0001'', 1, 1, 3, ''2025-06-02 08:00:00'', ''2025-06-03 14:00:00'', ''confirmed'', 2, 2500, 12, 15, ''Matériel électronique fragile''),
    (''ORD-2025-0002'', 2, 2, 4, ''2025-06-03 09:00:00'', ''2025-06-04 16:00:00'', ''confirmed'', 3, 5000, 18, 25, ''Produits alimentaires - maintenir chaîne du froid''),
    (''ORD-2025-0003'', 3, 3, 1, ''2025-06-04 10:00:00'', ''2025-06-05 12:00:00'', ''confirmed'', 1, 1200, 8, 10, ''Produits pharmaceutiques - livraison prioritaire''),
    (''ORD-2025-0004'', 4, 4, 2, ''2025-06-05 08:30:00'', ''2025-06-06 15:00:00'', ''confirmed'', 3, 3000, 15, 30, ''Vêtements - pas d''instructions particulières''),
    (''ORD-2025-0005'', 5, 5, 3, ''2025-06-06 07:00:00'', ''2025-06-07 10:00:00'', ''confirmed'', 2, 8000, 25, 12, ''Matériaux de construction - équipement de déchargement nécessaire'')'
    ';
    
    -- Insertion des expéditions
    EXECUTE '
    INSERT INTO shipments (reference, order_id, carrier_id, vehicle_id, driver_id, planned_pickup_date, planned_delivery_date, status, tracking_number, cost)
    VALUES 
    (''SHP-2025-0001'', 1, 1, 2, 2, ''2025-06-02 09:00:00'', ''2025-06-03 13:00:00'', ''planned'', ''TRK123456789'', 850.50),
    (''SHP-2025-0002'', 2, 2, 3, 3, ''2025-06-03 10:00:00'', ''2025-06-04 15:00:00'', ''planned'', ''TRK234567890'', 1250.75),
    (''SHP-2025-0003'', 3, 1, 1, 1, ''2025-06-04 11:00:00'', ''2025-06-05 11:00:00'', ''planned'', ''TRK345678901'', 950.25),
    (''SHP-2025-0004'', 4, 4, 4, 4, ''2025-06-05 09:30:00'', ''2025-06-06 14:00:00'', ''planned'', ''TRK456789012'', 780.00),
    (''SHP-2025-0005'', 5, 5, 5, 5, ''2025-06-06 08:00:00'', ''2025-06-07 09:00:00'', ''planned'', ''TRK567890123'', 1450.00)'
    ';
    
    -- Insertion des tournées
    EXECUTE '
    INSERT INTO routes (reference, carrier_id, vehicle_id, driver_id, planned_start_date, planned_end_date, status, total_distance, total_duration, optimization_score)
    VALUES 
    (''RTE-2025-0001'', 1, 2, 2, ''2025-06-02 08:00:00'', ''2025-06-03 18:00:00'', ''planned'', 650, 1800, 4.2),
    (''RTE-2025-0002'', 2, 3, 3, ''2025-06-03 07:00:00'', ''2025-06-04 19:00:00'', ''planned'', 720, 2100, 4.5),
    (''RTE-2025-0003'', 1, 1, 1, ''2025-06-04 06:00:00'', ''2025-06-05 20:00:00'', ''planned'', 850, 2400, 4.8),
    (''RTE-2025-0004'', 4, 4, 4, ''2025-06-05 07:30:00'', ''2025-06-06 17:30:00'', ''planned'', 580, 1700, 4.3),
    (''RTE-2025-0005'', 5, 5, 5, ''2025-06-06 06:30:00'', ''2025-06-07 16:00:00'', ''planned'', 420, 1500, 4.6)'
    ';
    
    -- Insertion des liens tournées-expéditions
    EXECUTE '
    INSERT INTO route_shipments (route_id, shipment_id, stop_number, planned_arrival_time, planned_departure_time, status)
    VALUES 
    (1, 1, 1, ''2025-06-02 09:00:00'', ''2025-06-02 10:00:00'', ''planned''),
    (2, 2, 1, ''2025-06-03 10:00:00'', ''2025-06-03 11:00:00'', ''planned''),
    (3, 3, 1, ''2025-06-04 11:00:00'', ''2025-06-04 12:00:00'', ''planned''),
    (4, 4, 1, ''2025-06-05 09:30:00'', ''2025-06-05 10:30:00'', ''planned''),
    (5, 5, 1, ''2025-06-06 08:00:00'', ''2025-06-06 09:30:00'', ''planned'')'
    ';
    
    -- Insertion des documents
    EXECUTE '
    INSERT INTO documents (reference, type, name, file_path, mime_type, size, order_id, shipment_id, processing_status)
    VALUES 
    (''DOC-2025-0001'', ''cmr'', ''CMR_ORD-2025-0001.pdf'', ''/documents/cmr/CMR_ORD-2025-0001.pdf'', ''application/pdf'', 256000, 1, 1, ''processed''),
    (''DOC-2025-0002'', ''delivery_note'', ''BL_ORD-2025-0001.pdf'', ''/documents/delivery_notes/BL_ORD-2025-0001.pdf'', ''application/pdf'', 198000, 1, 1, ''processed''),
    (''DOC-2025-0003'', ''cmr'', ''CMR_ORD-2025-0002.pdf'', ''/documents/cmr/CMR_ORD-2025-0002.pdf'', ''application/pdf'', 245000, 2, 2, ''processed''),
    (''DOC-2025-0004'', ''invoice'', ''INVOICE_ORD-2025-0001.pdf'', ''/documents/invoices/INVOICE_ORD-2025-0001.pdf'', ''application/pdf'', 320000, 1, 1, ''processed''),
    (''DOC-2025-0005'', ''packing_list'', ''PACKING_ORD-2025-0003.pdf'', ''/documents/packing/PACKING_ORD-2025-0003.pdf'', ''application/pdf'', 175000, 3, 3, ''processed'')'
    ';
    
    -- Insertion des tarifs
    EXECUTE '
    INSERT INTO rates (carrier_id, origin_zone, destination_zone, vehicle_type, weight_bracket_min, weight_bracket_max, price, price_unit, valid_from, valid_to)
    VALUES 
    (1, ''Paris'', ''Marseille'', ''tractor_trailer'', 0, 10000, 1.2, ''km'', ''2025-01-01'', ''2025-12-31''),
    (1, ''Paris'', ''Marseille'', ''tractor_trailer'', 10001, 30000, 1.1, ''km'', ''2025-01-01'', ''2025-12-31''),
    (1, ''Paris'', ''Marseille'', ''tractor_trailer'', 30001, 50000, 1.0, ''km'', ''2025-01-01'', ''2025-12-31''),
    (2, ''Lyon'', ''Bordeaux'', ''refrigerated_truck'', 0, 20000, 1.4, ''km'', ''2025-01-01'', ''2025-12-31''),
    (5, ''Lille'', ''Marseille'', ''heavy_duty'', 0, 60000, 1.6, ''km'', ''2025-01-01'', ''2025-12-31'')'
    ';
    
    -- Insertion des factures
    EXECUTE '
    INSERT INTO invoices (reference, type, entity_id, entity_type, issue_date, due_date, amount, tax_amount, total_amount, status)
    VALUES 
    (''INV-2025-0001'', ''client'', 1, ''client'', ''2025-05-15'', ''2025-06-15'', 850.50, 170.10, 1020.60, ''issued''),
    (''INV-2025-0002'', ''client'', 2, ''client'', ''2025-05-16'', ''2025-06-16'', 1250.75, 250.15, 1500.90, ''issued''),
    (''INV-2025-0003'', ''carrier'', 1, ''carrier'', ''2025-05-10'', ''2025-06-10'', 750.25, 150.05, 900.30, ''validated''),
    (''INV-2025-0004'', ''carrier'', 2, ''carrier'', ''2025-05-11'', ''2025-06-11'', 1100.50, 220.10, 1320.60, ''validated''),
    (''INV-2025-0005'', ''client'', 3, ''client'', ''2025-05-17'', ''2025-06-17'', 950.25, 190.05, 1140.30, ''issued'')'
    ';
    
    -- Insertion des événements de maintenance
    EXECUTE '
    INSERT INTO maintenance_events (vehicle_id, type, description, scheduled_date, status, cost)
    VALUES 
    (1, ''preventive'', ''Entretien régulier 50 000 km'', ''2025-07-15'', ''scheduled'', 850.00),
    (2, ''preventive'', ''Entretien régulier 40 000 km'', ''2025-08-10'', ''scheduled'', 750.00),
    (3, ''repair'', ''Remplacement système de réfrigération'', ''2025-06-05'', ''scheduled'', 2500.00),
    (4, ''inspection'', ''Contrôle technique annuel'', ''2025-08-05'', ''scheduled'', 350.00),
    (5, ''preventive'', ''Entretien régulier 30 000 km'', ''2025-07-25'', ''scheduled'', 950.00)'
    ';
    
    -- Insertion des données télématiques (échantillon)
    EXECUTE '
    INSERT INTO telematic_data (vehicle_id, timestamp, latitude, longitude, speed, heading, engine_status, fuel_level, odometer)
    VALUES 
    (1, ''2025-05-30 08:00:00'', 48.8566, 2.3522, 0, 0, ''on'', 85.5, 49850),
    (1, ''2025-05-30 08:15:00'', 48.8602, 2.3720, 45, 78, ''on'', 84.8, 49865),
    (2, ''2025-05-30 08:00:00'', 45.7640, 4.8357, 0, 0, ''on'', 90.2, 39750),
    (2, ''2025-05-30 08:15:00'', 45.7680, 4.8550, 50, 120, ''on'', 89.5, 39768),
    (3, ''2025-05-30 08:00:00'', 43.2965, 5.3698, 0, 0, ''on'', 78.3, 29950)'
    ';
    
    -- Insertion des KPIs
    EXECUTE '
    INSERT INTO kpis (name, category, value, unit, period_start, period_end, target_value)
    VALUES 
    (''Taux de livraison à l''heure'', ''performance'', 94.5, ''%'', ''2025-05-01'', ''2025-05-31'', 95),
    (''Coût moyen par km'', ''finance'', 1.15, ''EUR'', ''2025-05-01'', ''2025-05-31'', 1.10),
    (''Taux d''occupation des véhicules'', ''utilisation'', 82.3, ''%'', ''2025-05-01'', ''2025-05-31'', 85),
    (''Émissions CO2 moyennes'', ''environnement'', 0.85, ''kg/km'', ''2025-05-01'', ''2025-05-31'', 0.80),
    (''Satisfaction client'', ''qualité'', 4.7, ''score'', ''2025-05-01'', ''2025-05-31'', 4.8)'
    ';
    
    -- Insertion des prévisions
    EXECUTE '
    INSERT INTO forecasts (type, target_entity_type, period_start, period_end, value, unit, confidence)
    VALUES 
    (''demand'', ''orders'', ''2025-06-01'', ''2025-06-30'', 125, ''count'', 0.92),
    (''demand'', ''volume'', ''2025-06-01'', ''2025-06-30'', 450000, ''kg'', 0.88),
    (''cost'', ''transport'', ''2025-06-01'', ''2025-06-30'', 125000, ''EUR'', 0.85),
    (''maintenance'', ''vehicles'', ''2025-06-01'', ''2025-06-30'', 8500, ''EUR'', 0.82),
    (''capacity'', ''fleet'', ''2025-06-01'', ''2025-06-30'', 85, ''%'', 0.90)'
    ';
    
    -- Insertion des insights IA
    EXECUTE '
    INSERT INTO ai_insights (type, target_entity_type, target_entity_id, title, description, severity, status, confidence)
    VALUES 
    (''anomaly'', ''vehicle'', 3, ''Risque de panne système réfrigération'', ''Analyse des données télématiques indique une anomalie dans le système de réfrigération du véhicule IJ-789-KL. Maintenance préventive recommandée.'', ''high'', ''active'', 0.89),
    (''optimization'', ''route'', 2, ''Opportunité d''optimisation de tournée'', ''Regroupement possible des livraisons vers Lyon et Grenoble permettant une économie estimée à 15% sur les coûts de transport.'', ''medium'', ''active'', 0.92),
    (''prediction'', ''demand'', NULL, ''Pic de demande prévu'', ''Augmentation de 30% de la demande prévue pour la semaine du 15 juin en raison d''événements saisonniers.'', ''medium'', ''active'', 0.87),
    (''compliance'', ''driver'', 1, ''Temps de conduite limite approchée'', ''Le conducteur Michel Durand approche de sa limite légale de temps de conduite hebdomadaire. Planification à ajuster.'', ''high'', ''active'', 0.95),
    (''financial'', ''client'', 3, ''Retard de paiement probable'', ''Analyse des comportements de paiement indique un risque élevé de retard pour la facture INV-2025-0005.'', ''medium'', ''active'', 0.83)'
    ';
    
    -- Insertion des conversations avec l''assistant IA
    EXECUTE '
    INSERT INTO ai_assistant_conversations (user_id, start_time, title, context)
    VALUES 
    (1, ''2025-05-30 09:15:00'', ''Optimisation des tournées du 2 juin'', ''{"topic": "route_optimization", "entities": {"date": "2025-06-02"}}'')'
    ';
    
    -- Insertion des messages de conversation avec l''assistant IA
    EXECUTE '
    INSERT INTO ai_assistant_messages (conversation_id, sender_type, sender_id, content, timestamp)
    VALUES 
    (1, ''user'', 1, ''Comment optimiser les tournées du 2 juin pour réduire les coûts ?'', ''2025-05-30 09:15:10''),
    (1, ''ai'', NULL, ''J''ai analysé les tournées prévues pour le 2 juin. Je recommande de regrouper les livraisons ORD-2025-0001 et ORD-2025-0003 sur la même tournée, ce qui permettrait une économie estimée à 12% sur les coûts de transport. Souhaitez-vous que je génère une proposition de planning optimisé ?'', ''2025-05-30 09:15:15''),
    (1, ''user'', 1, ''Oui, génère une proposition et montre-moi les économies détaillées.'', ''2025-05-30 09:15:30''),
    (1, ''ai'', NULL, ''Voici la proposition de planning optimisé pour le 2 juin :\n\n1. Tournée RTE-2025-0001-OPT :\n   - Départ entrepôt à 07:30\n   - Chargement ORD-2025-0001 à 08:00\n   - Chargement ORD-2025-0003 à 09:30\n   - Livraison ORD-2025-0003 à 13:00\n   - Livraison ORD-2025-0001 à 15:30\n   - Retour entrepôt à 17:00\n\nÉconomies détaillées :\n- Distance : -85 km (-13%)\n- Carburant : -34 litres (-13%)\n- Coût total : -178,50 € (-12%)\n- Émissions CO2 : -89,25 kg (-13%)\n\nSouhaitez-vous que j''applique cette optimisation au planning ?'', ''2025-05-30 09:15:45'')'
    ';
    
    -- Insertion des paramètres du tenant
    EXECUTE '
    INSERT INTO settings (category, key, value, data_type, description)
    VALUES 
    (''general'', ''company_name'', ''Transport Solutions'', ''string'', ''Nom de l''entreprise''),
    (''general'', ''default_language'', ''fr'', ''string'', ''Langue par défaut''),
    (''general'', ''timezone'', ''Europe/Paris'', ''string'', ''Fuseau horaire''),
    (''optimization'', ''max_route_duration'', ''720'', ''integer'', ''Durée maximale d''une tournée en minutes''),
    (''optimization'', ''co2_weight'', ''0.3'', ''float'', ''Poids du facteur CO2 dans l''optimisation multi-objectifs'')'
    ';
    
    -- Revenir au schéma public
    EXECUTE 'SET search_path TO public';
END;
$$ LANGUAGE plpgsql;

-- Appeler la fonction pour créer et peupler les données du premier tenant
SELECT create_tenant_schema(1);
SELECT populate_tenant_data(1);

-- Appeler la fonction pour créer et peupler les données du deuxième tenant
SELECT create_tenant_schema(2);
SELECT populate_tenant_data(2);

-- Appeler la fonction pour créer et peupler les données du troisième tenant (demo)
SELECT create_tenant_schema(3);
SELECT populate_tenant_data(3);
