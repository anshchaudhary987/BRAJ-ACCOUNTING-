-- Braj Accounting Database Schema
-- This schema creates the necessary tables for the accounting system.

-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- States table
CREATE TABLE states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL
);

-- HSN Codes table
CREATE TABLE hsn_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    gst_rate NUMERIC(5, 2) NOT NULL,
    type VARCHAR(10) NOT NULL
);

-- TDS natures table
CREATE TABLE tds_natures (
    code VARCHAR(10) PRIMARY KEY,
    section VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    rate NUMERIC(5, 2) NOT NULL,
    threshold NUMERIC(15, 2)
);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- Changed from company_name to match repository
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state_id UUID NOT NULL REFERENCES states(id), -- Changed from state string
    pincode VARCHAR(20),
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

-- Groups table (predefined chart of accounts)
CREATE TABLE groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    parent_id VARCHAR(50) REFERENCES groups(id),
    type VARCHAR(50) NOT NULL,
    is_gst_relevant BOOLEAN DEFAULT FALSE,
    remarks TEXT
);

-- Ledgers table
CREATE TABLE ledgers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- Changed from ledger_name to match repository
    alias VARCHAR(255),
    group_id VARCHAR(50) NOT NULL REFERENCES groups(id),
    opening_balance NUMERIC(15, 2) DEFAULT 0,
    opening_balance_type VARCHAR(2) CHECK (opening_balance_type IN ('Dr', 'Cr')),
    opening_balance_date DATE,
    is_gst_applicable BOOLEAN DEFAULT FALSE,
    gst_registration_type VARCHAR(20) CHECK (gst_registration_type IN ('Regular', 'Composition', 'Unregistered', 'Consumer')),
    gstin VARCHAR(15),
    hsn_code_id UUID REFERENCES hsn_codes(id),
    state_id UUID REFERENCES states(id),
    pan VARCHAR(10),
    tds_applicable BOOLEAN DEFAULT FALSE, -- Changed from is_tds_applicable
    tds_nature_code VARCHAR(10) REFERENCES tds_natures(code),
    is_bank_ledger BOOLEAN DEFAULT FALSE,
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(11),
    bank_branch VARCHAR(255), -- Changed from bank_name
    is_party_ledger BOOLEAN DEFAULT FALSE,
    narration TEXT,
    is_active BOOLEAN DEFAULT TRUE, -- Changed from status VARCHAR
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vouchers table
CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    voucher_number VARCHAR(50) NOT NULL,
    voucher_type VARCHAR(20) NOT NULL CHECK (voucher_type IN ('Payment', 'Receipt', 'Contra', 'Sales', 'Purchase', 'Journal', 'Debit Note', 'Credit Note')),
    date DATE NOT NULL,
    effective_date DATE NOT NULL,
    financial_year VARCHAR(10) NOT NULL,
    reference VARCHAR(100),
    narration TEXT,
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
    is_debit BOOLEAN NOT NULL,
    cgst_amount NUMERIC(15, 2),
    sgst_amount NUMERIC(15, 2),
    igst_amount NUMERIC(15, 2),
    tds_amount NUMERIC(15, 2),
    gst_treatment_type VARCHAR(50),
    cheque_number VARCHAR(50),
    cheque_date DATE,
    bank_name VARCHAR(255),
    narration TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function to update voucher totals
CREATE OR REPLACE FUNCTION update_voucher_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE vouchers
        SET total_debit = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM voucher_entries 
            WHERE voucher_id = NEW.voucher_id AND is_debit = TRUE
        ),
        total_credit = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM voucher_entries 
            WHERE voucher_id = NEW.voucher_id AND is_debit = FALSE
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.voucher_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE vouchers
        SET total_debit = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM voucher_entries 
            WHERE voucher_id = OLD.voucher_id AND is_debit = TRUE
        ),
        total_credit = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM voucher_entries 
            WHERE voucher_id = OLD.voucher_id AND is_debit = FALSE
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
-- Note: Deferred until transaction commits
ALTER TABLE vouchers ADD CONSTRAINT chk_voucher_balanced CHECK (total_debit = total_credit) DEFERRABLE INITIALLY DEFERRED;

-- Indexes for performance
CREATE INDEX idx_ledgers_company_id ON ledgers(company_id);
CREATE INDEX idx_vouchers_company_id ON vouchers(company_id);
CREATE INDEX idx_voucher_entries_voucher_id ON voucher_entries(voucher_id);
CREATE INDEX idx_voucher_entries_ledger_id ON voucher_entries(ledger_id);
