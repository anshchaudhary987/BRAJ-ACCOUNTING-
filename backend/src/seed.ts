import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import pool from './config/database.js';

const groups = [
  { name: 'Cash', type: 'Assets' },
  { name: 'Bank Accounts', type: 'Assets' },
  { name: 'Sundry Debtors', type: 'Assets' },
  { name: 'Stock-in-Hand', type: 'Assets' },
  { name: 'Fixed Assets', type: 'Assets' },
  { name: 'Investments', type: 'Assets' },
  { name: 'Loans & Advances', type: 'Assets' },
  { name: 'Deposits', type: 'Assets' },
  { name: 'Sundry Creditors', type: 'Liabilities' },
  { name: 'Duties & Taxes', type: 'Liabilities' },
  { name: 'Loans (Liability)', type: 'Liabilities' },
  { name: 'Provisions', type: 'Liabilities' },
  { name: 'Sales', type: 'Income' },
  { name: 'Service Income', type: 'Income' },
  { name: 'Other Income', type: 'Income' },
  { name: 'Purchases', type: 'Expenditure' },
  { name: 'Direct Expenses', type: 'Expenditure' },
  { name: 'Indirect Expenses', type: 'Expenditure' },
  { name: 'Bank Charges', type: 'Expenditure' },
  { name: 'Depreciation', type: 'Expenditure' },
  { name: 'CGST Input', type: 'Assets' },
  { name: 'SGST Input', type: 'Assets' },
  { name: 'IGST Input', type: 'Assets' },
  { name: 'CGST Output', type: 'Liabilities' },
  { name: 'SGST Output', type: 'Liabilities' },
  { name: 'IGST Output', type: 'Liabilities' },
  { name: 'TDS Payable', type: 'Liabilities' }
];

const states = [
  { code: '01', name: 'Jammu & Kashmir', type: 'Union Territory' },
  { code: '02', name: 'Himachal Pradesh', type: 'State' },
  { code: '03', name: 'Punjab', type: 'State' },
  { code: '04', name: 'Chandigarh', type: 'Union Territory' },
  { code: '05', name: 'Uttarakhand', type: 'State' },
  { code: '06', name: 'Haryana', type: 'State' },
  { code: '07', name: 'Delhi', type: 'Union Territory' },
  { code: '08', name: 'Rajasthan', type: 'State' },
  { code: '09', name: 'Uttar Pradesh', type: 'State' },
  { code: '10', name: 'Bihar', type: 'State' },
  { code: '11', name: 'Sikkim', type: 'State' },
  { code: '12', name: 'Arunachal Pradesh', type: 'State' },
  { code: '13', name: 'Nagaland', type: 'State' },
  { code: '14', name: 'Manipur', type: 'State' },
  { code: '15', name: 'Mizoram', type: 'State' },
  { code: '16', name: 'Tripura', type: 'State' },
  { code: '17', name: 'Meghalaya', type: 'State' },
  { code: '18', name: 'Assam', type: 'State' },
  { code: '19', name: 'West Bengal', type: 'State' },
  { code: '20', name: 'Jharkhand', type: 'State' },
  { code: '21', name: 'Odisha', type: 'State' },
  { code: '22', name: 'Chhattisgarh', type: 'State' },
  { code: '23', name: 'Madhya Pradesh', type: 'State' },
  { code: '24', name: 'Gujarat', type: 'State' },
  { code: '26', name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'Union Territory' },
  { code: '27', name: 'Maharashtra', type: 'State' },
  { code: '29', name: 'Karnataka', type: 'State' },
  { code: '30', name: 'Goa', type: 'State' },
  { code: '31', name: 'Lakshadweep', type: 'Union Territory' },
  { code: '32', name: 'Kerala', type: 'State' },
  { code: '33', name: 'Tamil Nadu', type: 'State' },
  { code: '34', name: 'Puducherry', type: 'Union Territory' },
  { code: '35', name: 'Andaman and Nicobar Islands', type: 'Union Territory' },
  { code: '36', name: 'Telangana', type: 'State' },
  { code: '37', name: 'Andhra Pradesh', type: 'State' },
  { code: '38', name: 'Ladakh', type: 'Union Territory' }
];

const tdsNatures = [
  { code: '192', section: '192', description: 'Salary', rate: 0.00, threshold: 250000 },
  { code: '194A', section: '194A', description: 'Interest on Securities', rate: 10.00, threshold: 40000 },
  { code: '194C', section: '194C', description: 'Contractors/Sub-contractors', rate: 2.00, threshold: 30000 },
  { code: '194H', section: '194H', description: 'Commission or Brokerage', rate: 5.00, threshold: 15000 },
  { code: '194I_Land', section: '194I', description: 'Rent on Land/Building', rate: 10.00, threshold: 240000 },
  { code: '194I_Plant', section: '194I', description: 'Rent on Plant/Machinery', rate: 2.00, threshold: 240000 },
  { code: '194J', section: '194J', description: 'Professional/Technical Services', rate: 10.00, threshold: 30000 },
  { code: '194Q', section: '194Q', description: 'Purchase of Goods', rate: 0.10, threshold: 5000000 }
];

const hsnCodes = [
  { code: '8471', description: 'Computers and peripheral units', gst_rate: 18.00, type: 'HSN' },
  { code: '8517', description: 'Mobile phones and other communication devices', gst_rate: 18.00, type: 'HSN' },
  { code: '7113', description: 'Articles of jewellery', gst_rate: 3.00, type: 'HSN' },
  { code: '9983', description: 'Other professional, technical and business services', gst_rate: 18.00, type: 'SAC' },
  { code: '9987', description: 'Maintenance and repair services', gst_rate: 18.00, type: 'SAC' },
  { code: '1001', description: 'Wheat and meslin', gst_rate: 0.00, type: 'HSN' },
  { code: '1006', description: 'Rice', gst_rate: 0.00, type: 'HSN' },
  { code: '2201', description: 'Waters, including natural or artificial mineral waters', gst_rate: 12.00, type: 'HSN' }
];

async function seed() {
  try {
    // Seed Groups
    for (const group of groups) {
      await pool.query(
        'INSERT INTO groups (id, name, type) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [uuidv4(), group.name, group.type]
      );
    }
    console.log('Groups seeded successfully');

    // Seed States
    for (const state of states) {
      await pool.query(
        'INSERT INTO states (id, code, name, type) VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING',
        [uuidv4(), state.code, state.name, state.type]
      );
    }
    console.log('States seeded successfully');

    // Seed TDS Natures
    for (const tds of tdsNatures) {
      await pool.query(
        'INSERT INTO tds_natures (code, section, description, rate, threshold) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (code) DO NOTHING',
        [tds.code, tds.section, tds.description, tds.rate, tds.threshold]
      );
    }
    console.log('TDS Natures seeded successfully');

    // Seed HSN Codes
    for (const hsn of hsnCodes) {
      await pool.query(
        'INSERT INTO hsn_codes (id, code, description, gst_rate, type) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (code) DO NOTHING',
        [uuidv4(), hsn.code, hsn.description, hsn.gst_rate, hsn.type]
      );
    }
    console.log('HSN Codes seeded successfully');

    // ─── Seed Roles ───
    const roles = [
      { id: '00000000-0000-0000-0000-000000000001', name: 'Admin', description: 'Full access to all modules and company settings.' },
      { id: '00000000-0000-0000-0000-000000000002', name: 'Manager', description: 'View all reports and create/edit all vouchers.' },
      { id: '00000000-0000-0000-0000-000000000003', name: 'Accountant', description: 'Manage ledgers, create vouchers, and view reports.' },
      { id: '00000000-0000-0000-0000-000000000004', name: 'Data Entry', description: 'Restricted to voucher creation only.' },
    ];

    for (const role of roles) {
      await pool.query(
        'INSERT INTO roles (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [role.id, role.name, role.description]
      );
    }
    console.log('Roles seeded successfully');

    // ─── Seed System Admin User ───
    const adminUserId = '00000000-0000-0000-0000-000000000000';
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (id, name, email, password_hash, is_active) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
      [adminUserId, 'System Admin', 'admin@braj.com', adminPasswordHash, true]
    );
    console.log('System Admin user seeded successfully (Password: admin123)');

    // ─── Link Admin to all existing companies ───
    const adminRoleResult = await pool.query("SELECT id FROM roles WHERE name = 'Admin'");
    const adminRoleId = adminRoleResult.rows[0].id;
    
    const companiesResult = await pool.query('SELECT id FROM companies');
    for (const company of companiesResult.rows) {
      await pool.query(
        'INSERT INTO company_users (id, company_id, user_id, role_id) VALUES ($1, $2, $3, $4) ON CONFLICT (company_id, user_id) DO NOTHING',
        [uuidv4(), company.id, adminUserId, adminRoleId]
      );
    }
    console.log('System Admin linked to all companies');

  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

export default seed;