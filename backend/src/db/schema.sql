-- Braj Accounting Database Schema
-- Multi-tenant accounting software for India
-- Matches exactly the schema specified in requirements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    gstin TEXT,
    gst_registration_type TEXT NOT NULL DEFAULT 'Regular' CHECK (gst_registration_type IN ('Regular', 'Composition', 'Unregistered')),
    pan TEXT NOT NULL,
    tan TEXT,
    financial_year_start DATE NOT NULL,
    books_beginning_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Groups table (Chart of Accounts groups)
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Assets','Liabilities','Income','Expenditure')),
    parent_group_id UUID REFERENCES groups(id)
);

-- Ledgers table
CREATE TABLE IF NOT EXISTS ledgers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    group_id UUID NOT NULL REFERENCES groups(id),
    gstin TEXT,
    hsn_sac TEXT,
    state TEXT,
    opening_balance NUMERIC(15,2) DEFAULT 0,
    opening_balance_type TEXT CHECK (opening_balance_type IN ('Dr','Cr')) DEFAULT 'Dr',
    tds_applicable BOOLEAN DEFAULT false,
    tds_nature TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_branch TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, name)
);

-- Vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    voucher_number TEXT NOT NULL,
    voucher_type TEXT NOT NULL,
    date DATE NOT NULL,
    effective_date DATE,
    narration TEXT,
    total_debit NUMERIC(15,2) NOT NULL,
    total_credit NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, voucher_number),
    CHECK (total_debit = total_credit)
);

-- Voucher entries table
CREATE TABLE IF NOT EXISTS voucher_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    ledger_id UUID NOT NULL REFERENCES ledgers(id),
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    is_debit BOOLEAN NOT NULL,
    gst_treatment_type TEXT,
    cgst_amount NUMERIC(15,2) DEFAULT 0,
    sgst_amount NUMERIC(15,2) DEFAULT 0,
    igst_amount NUMERIC(15,2) DEFAULT 0,
    tds_amount NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- TDS Natures table (static seed)
CREATE TABLE IF NOT EXISTS tds_natures (
    code TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    rate NUMERIC(5,2) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ledgers_company_id ON ledgers(company_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_company_id ON vouchers(company_id);
CREATE INDEX IF NOT EXISTS idx_voucher_entries_voucher_id ON voucher_entries(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_entries_ledger_id ON voucher_entries(ledger_id);