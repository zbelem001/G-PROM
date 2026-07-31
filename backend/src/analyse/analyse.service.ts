import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
import { CreateAnalyseDto } from './dto/create-analyse.dto';

function normalizePayload(dto: Partial<CreateAnalyseDto>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (dto.numbLot !== undefined) payload.numblot = dto.numbLot;
  if (dto.DateEffecReception !== undefined) payload.dateeffecreception = dto.DateEffecReception || null;
  if (dto.Observation !== undefined) payload.observation = dto.Observation || null;
  if (dto.idAttributairePrev !== undefined) payload.idattributaireprev = dto.idAttributairePrev ? Number(dto.idAttributairePrev) : null;
  if (dto.DatePresentationRapport !== undefined) payload.datepresentationrapport = dto.DatePresentationRapport || null;
  return payload;
}

@Injectable()
export class AnalyseService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
  ) {}

  async create(createAnalyseDto: CreateAnalyseDto, userEmail?: string) {
    const payload = this.auditService.stampCreate(normalizePayload(createAnalyseDto), userEmail);
    const { data, error } = await this.supabaseService.client
      .from('Analyse')
      .insert([payload])
      .select();
    if (error) {
      throw new BadRequestException(error.message);
    }
    await this.auditService.log('Analyse', (payload.numblot as string) ?? '', 'CREATE', userEmail, null, data?.[0]);
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Analyse').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findOne(numbLot: string) {
    const { data, error } = await this.supabaseService.client
      .from('Analyse')
      .select('*')
      .eq('numblot', numbLot)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(numbLot: string, updateAnalyseDto: Partial<CreateAnalyseDto>, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Analyse').select('*').eq('numblot', numbLot).maybeSingle();
    const payload = this.auditService.stampUpdate(normalizePayload(updateAnalyseDto), userEmail);
    delete payload.numblot;
    const { data, error } = await this.supabaseService.client
      .from('Analyse')
      .update(payload)
      .eq('numblot', numbLot)
      .select()
      .single();
    if (error) {
      throw new BadRequestException(error.message);
    }
    await this.auditService.log('Analyse', numbLot, 'UPDATE', userEmail, existing.data, data);
    return data;
  }

  async remove(numbLot: string, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Analyse').select('*').eq('numblot', numbLot).maybeSingle();
    const { data, error } = await this.supabaseService.client
      .from('Analyse')
      .delete()
      .eq('numblot', numbLot);
    if (error) {
      throw new Error(error.message);
    }
    await this.auditService.log('Analyse', numbLot, 'DELETE', userEmail, existing.data, null);
    return data;
  }
}
