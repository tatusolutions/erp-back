import { DateTime } from 'luxon';
import { Knex } from 'knex';

export interface TaxRegime {
  id: number;
  code: string;
  description: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export default class TaxRegimeModel {
  private tableName = 'tax_regimes';
  
  constructor(private db: Knex) {}

  async create(data: Omit<TaxRegime, 'id' | 'created_at' | 'updated_at'>): Promise<TaxRegime> {
    const now = DateTime.now().toJSDate();
    const [result] = await this.db(this.tableName)
      .insert({
        ...data,
        created_at: now,
        updated_at: now
      })
      .returning('*');
    return result;
  }

  async findById(id: number): Promise<TaxRegime | undefined> {
    return this.db(this.tableName).where('id', id).first();
  }

  async findAllActive(): Promise<TaxRegime[]> {
    return this.db(this.tableName)
      .where('is_active', true)
      .orderBy('code');
  }

  async update(id: number, data: Partial<Omit<TaxRegime, 'id' | 'created_at'>>): Promise<TaxRegime | undefined> {
    const now = DateTime.now().toJSDate();
    const [result] = await this.db(this.tableName)
      .where('id', id)
      .update({
        ...data,
        updated_at: now
      })
      .returning('*');
    return result;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db(this.tableName)
      .where('id', id)
      .update({
        is_active: false,
        updated_at: DateTime.now().toJSDate()
      });
    return result > 0;
  }
}
