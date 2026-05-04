-- Braj Accounting Database Schema
-- This schema creates the necessary tables for the accounting system.

-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    gstin VARCHAR(15),
    pan VARCHAR(10) NOT NULL,
    tan VARCHAR(10),
    gst_registration_type VARCHAR(20) NOT NULL DEFAULT 'Regular' CHECK (gst_registration_type IN ('Regular', 'Composition', 'Unregistered')),
    financial_year_start DATE NOT NULL,
    books_beginning_date DATE NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ledgers table
CREATE TABLE ledgers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    ledger_name VARCHAR(255) NOT NULL,
    alias VARCHAR(255),
    group_id VARCHAR(50) NOT NULL, -- Reference to the groups table (we'll create it next)
    opening_balance NUMERIC(15, 2) DEFAULT 0,
    opening_balance_type VARCHAR(2) CHECK (opening_balance_type IN ('Dr', 'Cr')),
    opening_balance_date DATE,
    is_gst_applicable BOOLEAN DEFAULT FALSE,
    gst_registration_type VARCHAR(20) CHECK (gst_registration_type IN ('Regular', 'Composition', 'Unregistered', 'Consumer')),
    gstin VARCHAR(15),
    hsn_sac_code VARCHAR(20),
    state VARCHAR(50),
    pan VARCHAR(10),
    is_tds_applicable BOOLEAN DEFAULT FALSE,
    tds_nature_of_payment VARCHAR(10), -- e.g., '194C', '194J'
    is_bank_ledger BOOLEAN DEFAULT FALSE,
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(11),
    bank_name VARCHAR(255),
    is_party_ledger BOOLEAN DEFAULT FALSE,
    narration TEXT,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Groups table (predefined chart of accounts)
CREATE TABLE groups (
    id VARCHAR(50) PRIMARY KEY, -- We'll use the same ID as in the JSON, e.g., 'primary', 'capital-account'
    name VARCHAR(255) NOT NULL,
    parent_id VARCHAR(50) REFERENCES groups(id),
    type VARCHAR(50) NOT NULL, -- Asset, Liability, Revenue, Expense, etc.
    is_gst_relevant BOOLEAN DEFAULT FALSE,
    remarks TEXT
);

-- Vouchers table
CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    voucher_number VARCHAR(50) NOT NULL,
    voucher_type VARCHAR(20) NOT NULL CHECK (voucher_type IN ('Payment', 'Receipt', 'Contra', 'Sales', 'Purchase', 'Journal', 'Debit Note', 'Credit Note')),
    date DATE NOT NULL,
    reference VARCHAR(100),
    narration TEXT,
    -- We'll store the total debit and credit to enforce the constraint easily
    total_debit NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_credit NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Voucher entries table
CREATE TABLE voucher_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    ledger_id UUID NOT NULL REFERENCES ledgers(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    entry_type VARCHAR(2) NOT NULL CHECK (entry_type IN ('Dr', 'Cr')),
    cheque_number VARCHAR(50),
    cheque_date DATE,
    bank_name VARCHAR(255),
    narration TEXT,
    -- GST and TDS related fields can be added here if needed, but we are keeping it simple for now.
    -- The GST and TDS calculations are done in the service layer and the entries are stored as regular entries.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TDS natures table (optional)
CREATE TABLE tds_natures (
    id VARCHAR(10) PRIMARY KEY, -- e.g., '194C', '194J'
    description TEXT NOT NULL,
    rate NUMERIC(5, 2) NOT NULL, -- TDS rate in percentage
    threshold NUMERIC(15, 2) -- Threshold amount above which TDS is applicable
);

-- Now, we create a trigger function to update the totals in the vouchers table whenever voucher_entries are inserted, updated, or deleted.
-- Then we add a check constraint on the vouchers table to ensure total_debit = total_credit.

-- Trigger function to update voucher totals
CREATE OR REPLACE FUNCTION update_voucher_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE vouchers
        SET total_debit = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM voucher_entries 
            WHERE voucher_id = NEW.voucher_id AND entry_type = 'Dr'
        ),
        total_credit = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM voucher_entries 
            WHERE voucher_id = NEW.voucher_id AND entry_type = 'Cr'
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.voucher_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE vouchers
        SET total_debit = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM voucher_entries 
            WHERE voucher_id = OLD.voucher_id AND entry_type = 'Dr'
        ),
        total_credit = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM voucher_entries 
            WHERE voucher_id = OLD.voucher_id AND entry_type = 'Cr'
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.voucher_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update totals on voucher_entries changes
CREATE TRIGGER voucher_entries_totals_trigger
AFTER INSERT OR UPDATE OR DELETE ON voucher_entries
FOR EACH ROW EXECUTE FUNCTION update_voucher_totals();

-- Add a check constraint to ensure the voucher is balanced
ALTER TABLE vouchers ADD CONSTRAINT chk_voucher_balanced CHECK (total_debit = total_credit);

-- Indexes for performance
CREATE INDEX idx_ledgers_company_id ON ledgers(company_id);
CREATE INDEX idx_vouchers_company_id ON vouchers(company_id);
CREATE INDEX idx_voucher_entries_voucher_id ON voucher_entries(voucher_id);
CREATE INDEX idx_voucher_entries_ledger_id ON voucher_entries(ledger_id);

-- Seed the groups table with data from chart-of-accounts.json
-- We'll do this in a separate seed script, but we can also insert here if we have the data.
-- For now, we leave it empty and will seed via a script.
