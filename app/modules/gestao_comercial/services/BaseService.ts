import { Knex } from 'knex';

export default abstract class BaseService<T> {
  protected tableName: string;
  
  constructor(protected db: Knex) {}

  protected get query() {
    return this.db(this.tableName);
  }

  async findAll(conditions: Partial<T> = {}): Promise<T[]> {
    return this.query.where(conditions);
  }

  async findById(id: number | string): Promise<T | undefined> {
    return this.query.where('id', id).first();
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const [result] = await this.query.insert(data).returning('*');
    return result;
  }

  async update(id: number | string, data: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T | undefined> {
    const [result] = await this.query
      .where('id', id)
      .update(data)
      .returning('*');
    return result;
  }

  async delete(id: number | string): Promise<boolean> {
    const result = await this.query.where('id', id).delete();
    return result > 0;
  }
}
