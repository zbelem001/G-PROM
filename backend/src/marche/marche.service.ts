import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
import { CreateMarcheDto } from './dto/create-marche.dto';

@Injectable()
export class MarcheService {
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

  async create(createMarcheDto: CreateMarcheDto, userEmail?: string) {
    const payload = this.auditService.stampCreate(this.normalizeKeys(createMarcheDto), userEmail);
    // Statut is system-managed (see MarcheStatusService) — every marché starts "À lancer"
    // regardless of what the client sends.
    payload.statut = 'À lancer';

    try {
      const { data, error } = await this.supabaseService.client
        .from('Marche')
        .insert([payload])
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw new InternalServerErrorException(error.message);
      }

      const created = data?.[0];
      await this.auditService.log('Marche', created?.numbmarche ?? '', 'CREATE', userEmail, null, created);
      return data;
    } catch (error: any) {
      console.error('MarcheService.create error:', error?.message ?? error);
      throw new InternalServerErrorException(error?.message ?? 'Unknown error creating marche');
    }
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Marche').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findOne(numbMarche: string) {
    const { data, error } = await this.supabaseService.client
      .from('Marche')
      .select('*')
      .eq('numbmarche', numbMarche)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(numbMarche: string, updateMarcheDto: Partial<CreateMarcheDto>, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Marche').select('*').eq('numbmarche', numbMarche).maybeSingle();
    const payload = this.auditService.stampUpdate(this.normalizeKeys(updateMarcheDto), userEmail);
    // Statut is system-managed (see MarcheStatusService) — never editable through the
    // general update endpoint.
    delete payload.statut;
    const { data, error } = await this.supabaseService.client
      .from('Marche')
      .update(payload)
      .eq('numbmarche', numbMarche)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await this.auditService.log('Marche', numbMarche, 'UPDATE', userEmail, existing.data, data);
    return data;
  }

  async remove(numbMarche: string, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Marche').select('*').eq('numbmarche', numbMarche).maybeSingle();
    const { data, error } = await this.supabaseService.client
      .from('Marche')
      .delete()
      .eq('numbmarche', numbMarche);

    if (error) {
      throw new Error(error.message);
    }

    await this.auditService.log('Marche', numbMarche, 'DELETE', userEmail, existing.data, null);
    return data;
  }
}
