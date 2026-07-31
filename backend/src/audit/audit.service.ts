import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

@Injectable()
export class AuditService {
  constructor(private readonly supabaseService: SupabaseService) {}

  stampCreate<T extends object>(payload: T, userEmail: string | undefined, withDates = true): T & Record<string, unknown> {
    const stamped: Record<string, unknown> = { ...payload, usercreated: userEmail ?? null, userlastupdated: userEmail ?? null };
    if (withDates) {
      const now = new Date().toISOString();
      stamped.datecreated = now;
      stamped.datelastupdated = now;
    }
    return stamped as T & Record<string, unknown>;
  }

  stampUpdate<T extends object>(payload: T, userEmail: string | undefined, withDates = true): T & Record<string, unknown> {
    const stamped: Record<string, unknown> = { ...payload, userlastupdated: userEmail ?? null };
    if (withDates) {
      stamped.datelastupdated = new Date().toISOString();
    }
    return stamped as T & Record<string, unknown>;
  }

  // Best-effort: a failed audit write must never block the primary operation.
  async log(
    tableName: string,
    recordId: string | number,
    action: AuditAction,
    userEmail: string | undefined,
    oldValues: unknown,
    newValues: unknown,
  ): Promise<void> {
    const { error } = await this.supabaseService.client.from('AuditLog').insert([
      {
        table_name: tableName,
        record_id: String(recordId),
        action,
        user_email: userEmail ?? null,
        old_values: oldValues ?? null,
        new_values: newValues ?? null,
      },
    ]);
    if (error) {
      console.error('AuditService.log error:', error.message);
    }
  }

  async findAll(tableName?: string, recordId?: string) {
    let query = this.supabaseService.client
      .from('AuditLog')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (tableName) {
      query = query.eq('table_name', tableName);
    }
    if (recordId) {
      query = query.eq('record_id', recordId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('AuditService.findAll error:', error.message);
      return [];
    }
    return data ?? [];
  }
}
