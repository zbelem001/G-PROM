import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
import { CreateFinancementDto } from './dto/create-financement.dto';

@Injectable()
export class FinancementService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
  ) {}

  private normalizeKeys(dto: object): Record<string, unknown> {
    return Object.entries(dto).reduce((normalized, [key, value]) => {
      const lowerKey = key.replace(/([A-Z])/g, (match) => match.toLowerCase());
      normalized[lowerKey] = value;
      return normalized;
    }, {} as Record<string, unknown>);
  }

  private normalizeFinancement(raw: any): any {
    if (!raw) return raw;
    return {
      idFinancement: raw.idfinancement ?? raw.idFinancement,
      nomFinancement: raw.nomfinancement ?? raw.nomFinancement,
      idBailleur: raw.idbailleur ?? raw.idBailleur,
    };
  }

  async create(createFinancementDto: CreateFinancementDto, userEmail?: string) {
    const payload = this.auditService.stampCreate(this.normalizeKeys(createFinancementDto), userEmail);
    const { data, error } = await this.supabaseService.client
      .from('Financement')
      .insert([payload])
      .select()
      .single();
    if (error) {
      throw new Error(error.message);
    }
    await this.auditService.log('Financement', data?.idfinancement ?? '', 'CREATE', userEmail, null, data);
    return this.normalizeFinancement(data);
  }

  async findAll(idBailleur?: number) {
    let query = this.supabaseService.client.from('Financement').select('*').order('nomfinancement', { ascending: true });
    if (idBailleur !== undefined) {
      query = query.eq('idbailleur', idBailleur);
    }
    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []).map((row: any) => this.normalizeFinancement(row));
  }

  async findOne(idFinancement: number) {
    const { data, error } = await this.supabaseService.client
      .from('Financement')
      .select('*')
      .eq('idfinancement', idFinancement)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return this.normalizeFinancement(data);
  }

  async update(idFinancement: number, updateFinancementDto: Partial<CreateFinancementDto>, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Financement').select('*').eq('idfinancement', idFinancement).maybeSingle();
    const payload = this.auditService.stampUpdate(this.normalizeKeys(updateFinancementDto), userEmail);
    const { data, error } = await this.supabaseService.client
      .from('Financement')
      .update(payload)
      .eq('idfinancement', idFinancement)
      .select()
      .single();
    if (error) {
      throw new Error(error.message);
    }
    await this.auditService.log('Financement', idFinancement, 'UPDATE', userEmail, existing.data, data);
    return this.normalizeFinancement(data);
  }

  async remove(idFinancement: number, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Financement').select('*').eq('idfinancement', idFinancement).maybeSingle();
    const { error } = await this.supabaseService.client.from('Financement').delete().eq('idfinancement', idFinancement);
    if (error) {
      throw new Error(error.message);
    }
    await this.auditService.log('Financement', idFinancement, 'DELETE', userEmail, existing.data, null);
    return { success: true };
  }
}
