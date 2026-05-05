import type { DbClient, DbQueryResult } from '../types/database.js';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  passwordHash?: string;
}

export interface RoleRow {
  id: string;
  name: string;
  description: string;
}

export class UserRepository {
  private static mapUserRow(row: any): UserRow | null {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      isActive: row.is_active === 1 || row.is_active === true,
      passwordHash: row.password_hash
    };
  }

  static async findById(client: DbClient, id: string): Promise<UserRow | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result: DbQueryResult<any> = await client.query(query, [id]);
    return this.mapUserRow(result.rows[0]);
  }

  static async findByEmail(client: DbClient, email: string): Promise<UserRow | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result: DbQueryResult<any> = await client.query(query, [email]);
    return this.mapUserRow(result.rows[0]);
  }

  static async getUserRoleInCompany(client: DbClient, userId: string, companyId: string): Promise<string | null> {
    const query = `
      SELECT r.name 
      FROM roles r
      JOIN company_users cu ON r.id = cu.role_id
      WHERE cu.user_id = $1 AND cu.company_id = $2
    `;
    const result: DbQueryResult<{ name: string }> = await client.query(query, [userId, companyId]);
    return result.rows[0]?.name || null;
  }

  static async listByCompany(client: DbClient, companyId: string) {
    const query = `
      SELECT u.id, u.name, u.email, u.is_active, r.name as role_name, r.id as role_id
      FROM users u
      JOIN company_users cu ON u.id = cu.user_id
      JOIN roles r ON cu.role_id = r.id
      WHERE cu.company_id = $1
    `;
    const result: DbQueryResult<any> = await client.query(query, [companyId]);
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      isActive: row.is_active === 1 || row.is_active === true,
      role: row.role_name,
      roleId: row.role_id
    }));
  }

  static async listRoles(client: DbClient): Promise<RoleRow[]> {
    const query = 'SELECT * FROM roles';
    const result: DbQueryResult<any> = await client.query(query);
    return result.rows;
  }

  static async findRoleByName(client: DbClient, name: string): Promise<RoleRow | null> {
    const query = 'SELECT * FROM roles WHERE name = $1';
    const result: DbQueryResult<any> = await client.query(query, [name]);
    return result.rows[0] || null;
  }

  static async addUserToCompany(client: DbClient, userId: string, companyId: string, roleId: string) {
    const query = `
      INSERT INTO company_users (company_id, user_id, role_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (company_id, user_id) DO UPDATE SET role_id = EXCLUDED.role_id
    `;
    await client.query(query, [companyId, userId, roleId]);
  }

  static async createUser(client: DbClient, name: string, email: string) {
    const query = `
      INSERT INTO users (name, email, is_active)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result: DbQueryResult<any> = await client.query(query, [name, email, true]);
    return this.mapUserRow(result.rows[0]);
  }

  static async createUserWithPassword(client: DbClient, name: string, email: string, passwordHash: string) {
    const query = `
      INSERT INTO users (name, email, password_hash, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, is_active
    `;
    const result: DbQueryResult<any> = await client.query(query, [name, email, passwordHash, true]);
    return this.mapUserRow(result.rows[0]);
  }

  static async listUserCompanies(client: DbClient, userId: string) {
    const query = `
      SELECT c.id, c.name, c.state_id, r.name as role_name
      FROM companies c
      JOIN company_users cu ON c.id = cu.company_id
      JOIN roles r ON cu.role_id = r.id
      WHERE cu.user_id = $1
    `;
    const result: DbQueryResult<any> = await client.query(query, [userId]);
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      stateId: row.state_id,
      role: row.role_name
    }));
  }

  static async removeUserFromCompany(client: DbClient, userId: string, companyId: string) {
    const query = 'DELETE FROM company_users WHERE user_id = $1 AND company_id = $2';
    await client.query(query, [userId, companyId]);
  }
}
