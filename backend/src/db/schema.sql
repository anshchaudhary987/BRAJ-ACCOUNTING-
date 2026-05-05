-- Braj Accounting Database Schema
-- Multi-tenant accounting software for India
-- Matches exactly the schema specified in requirements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- States table (GST Codes)
CREATE TABLE IF NOT EXISTS states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- GST State Code (e.g., '27')
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('State', 'Union Territory'))
);

-- HSN/SAC Codes table
CREATE TABLE IF NOT EXISTS hsn_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    gst_rate NUMERIC(5,2) DEFAULT 0,
    type TEXT NOT NULL CHECK (type IN ('HSN', 'SAC'))
);

-- TDS Natures table
CREATE TABLE IF NOT EXISTS tds_natures (
    code TEXT PRIMARY KEY, -- e.g., '194C'
    section TEXT NOT NULL, -- e.g., '194C'
    description TEXT NOT NULL,
    rate NUMERIC(5,2) NOT NULL,
    threshold NUMERIC(15,2) DEFAULT 0
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    state_id UUID NOT NULL REFERENCES states(id),
    gstin TEXT,
    gst_registration_type TEXT NOT NULL DEFAULT 'Regular' CHECK (gst_registration_type IN ('Regular', 'Composition', 'Unregistered')),
    pan TEXT NOT NULL,
    tan TEXT,
    financial_year_start DATE NOT NULL,
    books_beginning_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
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
    hsn_code_id UUID REFERENCES hsn_codes(id),
    state_id UUID REFERENCES states(id),
    opening_balance NUMERIC(15,2) DEFAULT 0,
    opening_balance_type TEXT CHECK (opening_balance_type IN ('Dr','Cr')) DEFAULT 'Dr',
    tds_applicable BOOLEAN DEFAULT false,
    tds_nature_code TEXT REFERENCES tds_natures(code),
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_branch TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
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
    financial_year TEXT NOT NULL, -- e.g., '2024-25'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, voucher_number, financial_year),
    CHECK (total_debit = total_credit)
);

-- Voucher entries table
CREATE TABLE IF NOT EXISTS voucher_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    ledger_id UUID NOT NULL REFERENCES ledgers(id),
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    is_debit BOOLEAN NOT NULL,
    gst_treatment_type TEXT, -- 'Intra-state', 'Inter-state', 'Export', 'Exempt'
    cgst_amount NUMERIC(15,2) DEFAULT 0,
    sgst_amount NUMERIC(15,2) DEFAULT 0,
    igst_amount NUMERIC(15,2) DEFAULT 0,
    tds_amount NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ledgers_company_id ON ledgers(company_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_company_id ON vouchers(company_id);
CREATE INDEX IF NOT EXISTS idx_voucher_entries_voucher_id ON voucher_entries(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_entries_ledger_id ON voucher_entries(ledger_id);

-- ─── Multi-User Roles System ───

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL, -- 'Admin', 'Manager', 'Accountant', 'Data Entry'
    description TEXT
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Company Users mapping (Tenancy context)
CREATE TABLE IF NOT EXISTS company_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id),
    UNIQUE(company_id, user_id)
);

-- ─── Inventory Management Module ───

-- Units of measure
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- 'Nos', 'Kgs', 'Ltrs'
    formal_name TEXT,
    UNIQUE(company_id, name)
);

-- Godowns/Warehouses
CREATE TABLE IF NOT EXISTS godowns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    UNIQUE(company_id, name)
);

-- Stock Groups (Hierarchical)
CREATE TABLE IF NOT EXISTS stock_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    parent_group_id UUID REFERENCES stock_groups(id),
    UNIQUE(company_id, name)
);

-- Stock Items
CREATE TABLE IF NOT EXISTS stock_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit_id UUID NOT NULL REFERENCES units(id),
    stock_group_id UUID REFERENCES stock_groups(id),
    opening_balance_qty NUMERIC(15,3) DEFAULT 0,
    opening_balance_value NUMERIC(15,2) DEFAULT 0,
    sales_ledger_id UUID REFERENCES ledgers(id),
    purchase_ledger_id UUID REFERENCES ledgers(id),
    gst_applicable BOOLEAN DEFAULT true,
    hsn_code_id UUID REFERENCES hsn_codes(id),
    tax_rate NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, name)
);

-- Stock Journals (Transactions)
CREATE TABLE IF NOT EXISTS stock_journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Receipt', 'Issue', 'Transfer')),
    narration TEXT,
    voucher_id UUID REFERENCES vouchers(id), -- Linked accounting voucher
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Stock Journal Entries
CREATE TABLE IF NOT EXISTS stock_journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_journal_id UUID NOT NULL REFERENCES stock_journals(id) ON DELETE CASCADE,
    stock_item_id UUID NOT NULL REFERENCES stock_items(id),
    godown_id UUID NOT NULL REFERENCES godowns(id),
    quantity NUMERIC(15,3) NOT NULL,
    rate NUMERIC(15,2) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    is_inward BOOLEAN NOT NULL -- true for Receipt/Transfer-In, false for Issue/Transfer-Out
);

-- Indexes for Inventory
CREATE INDEX IF NOT EXISTS idx_stock_items_company_id ON stock_items(company_id);
CREATE INDEX IF NOT EXISTS idx_stock_journals_company_id ON stock_journals(company_id);
CREATE INDEX IF NOT EXISTS idx_stock_journal_entries_journal_id ON stock_journal_entries(stock_journal_id);
CREATE INDEX IF NOT EXISTS idx_stock_journal_entries_item_id ON stock_journal_entries(stock_item_id);