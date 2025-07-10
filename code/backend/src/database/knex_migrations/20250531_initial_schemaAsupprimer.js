/**
 * Migration Knex.js pour la création du schéma initial du TMS
 * 
 * Cette migration crée :
 * 1. Le schéma partagé (shared) avec ses tables
 * 2. La fonction pour créer un schéma tenant avec toutes ses tables
 */

exports.up = function(knex) {
  return knex.raw(`
    -- Création du schéma partagé (tables communes à tous les tenants)
    CREATE SCHEMA IF NOT EXISTS shared;

    -- Utilisation du schéma partagé
    SET search_path TO shared;

    -- Table des tenants (clients du SaaS)
    CREATE TABLE tenants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        subdomain VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        subscription_plan VARCHAR(50) NOT NULL DEFAULT 'standard',
        subscription_start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        subscription_end_date TIMESTAMP,
        contact_email VARCHAR(255) NOT NULL,
        contact_phone VARCHAR(50),
        max_users INTEGER NOT NULL DEFAULT 5,
        settings JSONB
    );

    -- Table des utilisateurs globaux (administrateurs système)
    CREATE TABLE system_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        last_login TIMESTAMP,
        status VARCHAR(20) NOT NULL DEFAULT 'active'
    );

    -- Table des modèles IA partagés
    CREATE TABLE ai_models (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        version VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        configuration JSONB,
        metrics JSONB
    );

    -- Table des logs système
    CREATE TABLE system_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        level VARCHAR(20) NOT NULL,
        source VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        details JSONB
    );

    -- Fonction pour créer un schéma tenant et ses tables
    CREATE OR REPLACE FUNCTION create_tenant_schema(tenant_id INTEGER) 
    RETURNS VOID AS $$
    DECLARE
        schema_name TEXT;
    BEGIN
        -- Définir le nom du schéma
        schema_name := 'tenant_' || tenant_id;
        
        -- Créer le schéma
        EXECUTE 'CREATE SCHEMA ' || schema_name;
        
        -- Définir le search_path pour créer les tables dans ce schéma
        EXECUTE 'SET search_path TO ' || schema_name;
        
        -- Table des utilisateurs du tenant
        EXECUTE '
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            role VARCHAR(50) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            last_login TIMESTAMP,
            status VARCHAR(20) NOT NULL DEFAULT ''active'',
            settings JSONB
        )';
        
        -- Table des rôles et permissions
        EXECUTE '
        CREATE TABLE roles (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL,
            description TEXT,
            permissions JSONB NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP
        )';
        
        -- Table des clients
        EXECUTE '
        CREATE TABLE clients (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(50) UNIQUE,
            address TEXT,
            city VARCHAR(100),
            postal_code VARCHAR(20),
            country VARCHAR(100),
            contact_name VARCHAR(100),
            contact_email VARCHAR(255),
            contact_phone VARCHAR(50),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            status VARCHAR(20) NOT NULL DEFAULT ''active'',
            category VARCHAR(50),
            notes TEXT,
            settings JSONB
        )';
        
        -- Table des transporteurs
        EXECUTE '
        CREATE TABLE carriers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(50) UNIQUE,
            address TEXT,
            city VARCHAR(100),
            postal_code VARCHAR(20),
            country VARCHAR(100),
            contact_name VARCHAR(100),
            contact_email VARCHAR(255),
            contact_phone VARCHAR(50),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            status VARCHAR(20) NOT NULL DEFAULT ''active'',
            category VARCHAR(50),
            capabilities JSONB,
            rating DECIMAL(3,2),
            notes TEXT
        )';
        
        -- Table des sites (entrepôts, usines, etc.)
        EXECUTE '
        CREATE TABLE sites (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(50) UNIQUE,
            type VARCHAR(50) NOT NULL,
            address TEXT NOT NULL,
            city VARCHAR(100) NOT NULL,
            postal_code VARCHAR(20) NOT NULL,
            country VARCHAR(100) NOT NULL,
            latitude DECIMAL(10,8),
            longitude DECIMAL(11,8),
            contact_name VARCHAR(100),
            contact_email VARCHAR(255),
            contact_phone VARCHAR(50),
            opening_hours JSONB,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            status VARCHAR(20) NOT NULL DEFAULT ''active'',
            client_id INTEGER REFERENCES clients(id),
            notes TEXT,
            capabilities JSONB
        )';
        
        -- Table des véhicules
        EXECUTE '
        CREATE TABLE vehicles (
            id SERIAL PRIMARY KEY,
            registration_number VARCHAR(50) UNIQUE NOT NULL,
            type VARCHAR(50) NOT NULL,
            brand VARCHAR(50),
            model VARCHAR(50),
            year INTEGER,
            max_weight DECIMAL(10,2),
            max_volume DECIMAL(10,2),
            max_length DECIMAL(10,2),
            max_width DECIMAL(10,2),
            max_height DECIMAL(10,2),
            carrier_id INTEGER REFERENCES carriers(id),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            status VARCHAR(20) NOT NULL DEFAULT ''active'',
            last_maintenance_date TIMESTAMP,
            next_maintenance_date TIMESTAMP,
            telematic_device_id VARCHAR(100),
            notes TEXT,
            features JSONB
        )';
        
        -- Table des conducteurs
        EXECUTE '
        CREATE TABLE drivers (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(50),
            license_number VARCHAR(50),
            license_type VARCHAR(50),
            license_expiry_date DATE,
            carrier_id INTEGER REFERENCES carriers(id),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            status VARCHAR(20) NOT NULL DEFAULT ''active'',
            notes TEXT,
            qualifications JSONB
        )';
        
        -- Table des commandes
        EXECUTE '
        CREATE TABLE orders (
            id SERIAL PRIMARY KEY,
            reference VARCHAR(50) UNIQUE NOT NULL,
            client_id INTEGER REFERENCES clients(id) NOT NULL,
            origin_site_id INTEGER REFERENCES sites(id) NOT NULL,
            destination_site_id INTEGER REFERENCES sites(id) NOT NULL,
            requested_pickup_date TIMESTAMP,
            requested_delivery_date TIMESTAMP,
            status VARCHAR(50) NOT NULL DEFAULT ''created'',
            priority INTEGER DEFAULT 3,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            total_weight DECIMAL(10,2),
            total_volume DECIMAL(10,2),
            package_count INTEGER,
            special_instructions TEXT,
            internal_notes TEXT,
            carrier_id INTEGER REFERENCES carriers(id),
            assigned_vehicle_id INTEGER REFERENCES vehicles(id),
            assigned_driver_id INTEGER REFERENCES drivers(id),
            metadata JSONB
        )';
        
        -- Table des expéditions
        EXECUTE '
        CREATE TABLE shipments (
            id SERIAL PRIMARY KEY,
            reference VARCHAR(50) UNIQUE NOT NULL,
            order_id INTEGER REFERENCES orders(id) NOT NULL,
            carrier_id INTEGER REFERENCES carriers(id) NOT NULL,
            vehicle_id INTEGER REFERENCES vehicles(id),
            driver_id INTEGER REFERENCES drivers(id),
            planned_pickup_date TIMESTAMP,
            actual_pickup_date TIMESTAMP,
            planned_delivery_date TIMESTAMP,
            actual_delivery_date TIMESTAMP,
            status VARCHAR(50) NOT NULL DEFAULT ''planned'',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            tracking_number VARCHAR(100),
            tracking_url TEXT,
            cost DECIMAL(10,2),
            notes TEXT,
            route_data JSONB,
            events JSONB
        )';
        
        -- Table des tournées
        EXECUTE '
        CREATE TABLE routes (
            id SERIAL PRIMARY KEY,
            reference VARCHAR(50) UNIQUE NOT NULL,
            carrier_id INTEGER REFERENCES carriers(id) NOT NULL,
            vehicle_id INTEGER REFERENCES vehicles(id),
            driver_id INTEGER REFERENCES drivers(id),
            planned_start_date TIMESTAMP,
            actual_start_date TIMESTAMP,
            planned_end_date TIMESTAMP,
            actual_end_date TIMESTAMP,
            status VARCHAR(50) NOT NULL DEFAULT ''planned'',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            total_distance DECIMAL(10,2),
            total_duration INTEGER,
            optimization_score DECIMAL(5,2),
            notes TEXT,
            route_data JSONB,
            events JSONB
        )';
        
        -- Table de liaison entre tournées et expéditions
        EXECUTE '
        CREATE TABLE route_shipments (
            route_id INTEGER REFERENCES routes(id) NOT NULL,
            shipment_id INTEGER REFERENCES shipments(id) NOT NULL,
            stop_number INTEGER NOT NULL,
            planned_arrival_time TIMESTAMP,
            actual_arrival_time TIMESTAMP,
            planned_departure_time TIMESTAMP,
            actual_departure_time TIMESTAMP,
            status VARCHAR(50) NOT NULL DEFAULT ''planned'',
            notes TEXT,
            PRIMARY KEY (route_id, shipment_id)
        )';
        
        -- Table des documents
        EXECUTE '
        CREATE TABLE documents (
            id SERIAL PRIMARY KEY,
            reference VARCHAR(50) NOT NULL,
            type VARCHAR(50) NOT NULL,
            name VARCHAR(255) NOT NULL,
            file_path TEXT NOT NULL,
            mime_type VARCHAR(100),
            size INTEGER,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            order_id INTEGER REFERENCES orders(id),
            shipment_id INTEGER REFERENCES shipments(id),
            route_id INTEGER REFERENCES routes(id),
            client_id INTEGER REFERENCES clients(id),
            carrier_id INTEGER REFERENCES carriers(id),
            metadata JSONB,
            extracted_data JSONB,
            processing_status VARCHAR(50) DEFAULT ''pending'',
            processing_notes TEXT
        )';
        
        -- Table des tarifs
        EXECUTE '
        CREATE TABLE rates (
            id SERIAL PRIMARY KEY,
            carrier_id INTEGER REFERENCES carriers(id) NOT NULL,
            origin_zone VARCHAR(100),
            destination_zone VARCHAR(100),
            vehicle_type VARCHAR(50),
            weight_bracket_min DECIMAL(10,2),
            weight_bracket_max DECIMAL(10,2),
            price DECIMAL(10,2) NOT NULL,
            price_unit VARCHAR(20) NOT NULL,
            valid_from DATE NOT NULL,
            valid_to DATE,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            conditions JSONB
        )';
        
        -- Table des factures
        EXECUTE '
        CREATE TABLE invoices (
            id SERIAL PRIMARY KEY,
            reference VARCHAR(50) UNIQUE NOT NULL,
            type VARCHAR(20) NOT NULL,
            entity_id INTEGER NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            issue_date DATE NOT NULL,
            due_date DATE NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            tax_amount DECIMAL(10,2) NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT ''issued'',
            payment_date DATE,
            payment_reference VARCHAR(100),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            notes TEXT,
            items JSONB
        )';
        
        -- Table des événements de maintenance
        EXECUTE '
        CREATE TABLE maintenance_events (
            id SERIAL PRIMARY KEY,
            vehicle_id INTEGER REFERENCES vehicles(id) NOT NULL,
            type VARCHAR(50) NOT NULL,
            description TEXT,
            scheduled_date TIMESTAMP,
            completed_date TIMESTAMP,
            cost DECIMAL(10,2),
            status VARCHAR(50) NOT NULL DEFAULT ''scheduled'',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            technician VARCHAR(100),
            location VARCHAR(100),
            notes TEXT,
            parts JSONB
        )';
        
        -- Table des données télématiques
        EXECUTE '
        CREATE TABLE telematic_data (
            id SERIAL PRIMARY KEY,
            vehicle_id INTEGER REFERENCES vehicles(id) NOT NULL,
            timestamp TIMESTAMP NOT NULL,
            latitude DECIMAL(10,8),
            longitude DECIMAL(11,8),
            speed DECIMAL(5,2),
            heading INTEGER,
            engine_status VARCHAR(20),
            fuel_level DECIMAL(5,2),
            odometer DECIMAL(10,2),
            engine_temperature DECIMAL(5,2),
            battery_voltage DECIMAL(5,2),
            diagnostic_codes JSONB,
            additional_data JSONB
        )';
        
        -- Table des KPIs
        EXECUTE '
        CREATE TABLE kpis (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            category VARCHAR(50) NOT NULL,
            value DECIMAL(10,2) NOT NULL,
            unit VARCHAR(20),
            period_start DATE NOT NULL,
            period_end DATE NOT NULL,
            target_value DECIMAL(10,2),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            metadata JSONB
        )';
        
        -- Table des prévisions
        EXECUTE '
        CREATE TABLE forecasts (
            id SERIAL PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            target_entity_type VARCHAR(50) NOT NULL,
            target_entity_id INTEGER,
            period_start DATE NOT NULL,
            period_end DATE NOT NULL,
            value DECIMAL(10,2) NOT NULL,
            unit VARCHAR(20) NOT NULL,
            confidence DECIMAL(5,2),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            model_id INTEGER,
            factors JSONB,
            metadata JSONB
        )';
        
        -- Table des insights IA
        EXECUTE '
        CREATE TABLE ai_insights (
            id SERIAL PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            target_entity_type VARCHAR(50),
            target_entity_id INTEGER,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            severity VARCHAR(20),
            status VARCHAR(20) NOT NULL DEFAULT ''active'',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            expiry_date TIMESTAMP,
            model_id INTEGER,
            confidence DECIMAL(5,2),
            recommendations JSONB,
            metadata JSONB
        )';
        
        -- Table des conversations avec l''assistant IA
        EXECUTE '
        CREATE TABLE ai_assistant_conversations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) NOT NULL,
            start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            end_time TIMESTAMP,
            title VARCHAR(255),
            context JSONB,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP
        )';
        
        -- Table des messages de conversation avec l''assistant IA
        EXECUTE '
        CREATE TABLE ai_assistant_messages (
            id SERIAL PRIMARY KEY,
            conversation_id INTEGER REFERENCES ai_assistant_conversations(id) NOT NULL,
            sender_type VARCHAR(20) NOT NULL,
            sender_id INTEGER,
            content TEXT NOT NULL,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            metadata JSONB
        )';
        
        -- Table des paramètres du tenant
        EXECUTE '
        CREATE TABLE settings (
            id SERIAL PRIMARY KEY,
            category VARCHAR(50) NOT NULL,
            key VARCHAR(100) NOT NULL,
            value TEXT,
            data_type VARCHAR(20) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            description TEXT,
            UNIQUE(category, key)
        )';
        
        -- Table des logs du tenant
        EXECUTE '
        CREATE TABLE logs (
            id SERIAL PRIMARY KEY,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            level VARCHAR(20) NOT NULL,
            source VARCHAR(100) NOT NULL,
            user_id INTEGER REFERENCES users(id),
            message TEXT NOT NULL,
            details JSONB
        )';
        
        -- Revenir au schéma public
        EXECUTE 'SET search_path TO public';
    END;
    $$ LANGUAGE plpgsql;

    -- Revenir au schéma public
    SET search_path TO public;
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    -- Supprimer la fonction de création de schéma tenant
    DROP FUNCTION IF EXISTS create_tenant_schema;
    
    -- Supprimer les tables du schéma shared
    DROP SCHEMA IF EXISTS shared CASCADE;
    
    -- Supprimer tous les schémas tenant existants
    -- Note: Cette partie est dangereuse et doit être utilisée avec précaution
    -- DO $$
    -- DECLARE
    --   schema_name text;
    -- BEGIN
    --   FOR schema_name IN (SELECT nspname FROM pg_namespace WHERE nspname LIKE 'tenant_%')
    --   LOOP
    --     EXECUTE 'DROP SCHEMA IF EXISTS ' || schema_name || ' CASCADE';
    --   END LOOP;
    -- END $$;
  `);
};
