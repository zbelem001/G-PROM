import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
import { CreateAvenantDto } from './dto/create-avenant.dto';

function normalizeKeys(dto: object): Record<string, unknown> {
  return Object.entries(dto).reduce((normalized, [key, value]) => {
    const lowerKey = key.replace(/([A-Z])/g, (match) => match.toLowerCase());
    normalized[lowerKey] = value;
    return normalized;
  }, {} as Record<string, unknown>);
}

@Injectable()
export class AvenantService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
  ) {}

  async create(createAvenantDto: CreateAvenantDto, userEmail?: string) {
    const payload = this.auditService.stampCreate(normalizeKeys(createAvenantDto), userEmail);
    const { data, error } = await this.supabaseService.client
      .from('Avenant')
      .insert([payload])
      .select()
      .single();
    if (error) throw new Error(error.message);
    await this.auditService.log('Avenant', data?.idavenant ?? '', 'CREATE', userEmail, null, data);
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Avenant').select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(idAvenant: number) {
    const { data, error } = await this.supabaseService.client
      .from('Avenant')
      .select('*')
      .eq('idavenant', idAvenant)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async update(idAvenant: number, updateAvenantDto: Partial<CreateAvenantDto>, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Avenant').select('*').eq('idavenant', idAvenant).maybeSingle();
    const payload = this.auditService.stampUpdate(normalizeKeys(updateAvenantDto), userEmail);
    const { data, error } = await this.supabaseService.client
      .from('Avenant')
      .update(payload)
      .eq('idavenant', idAvenant)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await this.auditService.log('Avenant', idAvenant, 'UPDATE', userEmail, existing.data, data);
    return data;
  }

  async remove(idAvenant: number, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Avenant').select('*').eq('idavenant', idAvenant).maybeSingle();
    const { data, error } = await this.supabaseService.client
      .from('Avenant')
      .delete()
      .eq('idavenant', idAvenant);
    if (error) throw new Error(error.message);
    await this.auditService.log('Avenant', idAvenant, 'DELETE', userEmail, existing.data, null);
    return data;
  }
}
