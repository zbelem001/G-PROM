import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
import { CreatePpmDto } from './dto/create-ppm.dto';

@Injectable()
export class PpmService {
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

  async create(createPpmDto: CreatePpmDto, userEmail?: string) {
    // The numéro is reused as-is for the future Marche row — it must not already be taken.
    const { data: existingMarche } = await this.supabaseService.client
      .from('Marche')
      .select('numbmarche')
      .eq('numbmarche', createPpmDto.numbMarche)
      .maybeSingle();
    if (existingMarche) {
      throw new BadRequestException(`Le numéro ${createPpmDto.numbMarche} est déjà utilisé par un marché existant.`);
    }

    const payload = this.auditService.stampCreate(this.normalizeKeys(createPpmDto), userEmail);
    // Statut is system-managed (see PpmTransferService) — every entry starts "Planifié".
    payload.statut = 'Planifié';

    const { data, error } = await this.supabaseService.client
      .from('PPM')
      .insert([payload])
      .select()
      .single();
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    await this.auditService.log('PPM', data?.numbmarche ?? '', 'CREATE', userEmail, null, data);
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client
      .from('PPM')
      .select('*')
      .order('dateprevuelancement', { ascending: true });
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return data ?? [];
  }

  async findOne(numbMarche: string) {
    const { data, error } = await this.supabaseService.client
      .from('PPM')
      .select('*')
      .eq('numbmarche', numbMarche)
      .maybeSingle();
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async update(numbMarche: string, updatePpmDto: Partial<CreatePpmDto>, userEmail?: string) {
    const existing = await this.supabaseService.client.from('PPM').select('*').eq('numbmarche', numbMarche).maybeSingle();
    const payload = this.auditService.stampUpdate(this.normalizeKeys(updatePpmDto), userEmail);
    delete payload.numbmarche;
    // Statut is system-managed — only PpmTransferService flips it to "Transféré".
    delete payload.statut;

    const { data, error } = await this.supabaseService.client
      .from('PPM')
      .update(payload)
      .eq('numbmarche', numbMarche)
      .select()
      .single();
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    await this.auditService.log('PPM', numbMarche, 'UPDATE', userEmail, existing.data, data);
    return data;
  }

  async remove(numbMarche: string, userEmail?: string) {
    const existing = await this.supabaseService.client.from('PPM').select('*').eq('numbmarche', numbMarche).maybeSingle();
    const { error } = await this.supabaseService.client.from('PPM').delete().eq('numbmarche', numbMarche);
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    await this.auditService.log('PPM', numbMarche, 'DELETE', userEmail, existing.data, null);
    return { success: true };
  }
}
