import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAttributaireDto } from './dto/create-attributaire.dto';

function normalizePayload(dto: Partial<CreateAttributaireDto>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (dto.idSoumissionAttribuee !== undefined) payload.idsoumissionattribuee = dto.idSoumissionAttribuee;
  if (dto.MontantEffec !== undefined) payload.montanteffec = dto.MontantEffec ? Number(dto.MontantEffec) : null;
  if (dto.DelaiExecutionEffec !== undefined) payload.delaiexecutioneffec = dto.DelaiExecutionEffec ? Number(dto.DelaiExecutionEffec) : null;
  if (dto.DateDemarage !== undefined) payload.datedemarage = dto.DateDemarage || null;
  if (dto.DatePrevFin !== undefined) payload.dateprevfin = dto.DatePrevFin || null;
  if (dto.Observation !== undefined) payload.observation = dto.Observation || null;
  if (dto.Statut !== undefined) payload.statut = dto.Statut || null;
  return payload;
}

@Injectable()
export class AttributaireService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createAttributaireDto: CreateAttributaireDto) {
    const payload = normalizePayload(createAttributaireDto);
    const { data, error } = await this.supabaseService.client
      .from('Attributaire')
      .insert([payload])
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Attributaire').select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(idSoumissionAttribuee: string) {
    const { data, error } = await this.supabaseService.client
      .from('Attributaire')
      .select('*')
      .eq('idsoumissionattribuee', idSoumissionAttribuee)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async update(idSoumissionAttribuee: string, updateAttributaireDto: Partial<CreateAttributaireDto>) {
    const payload = normalizePayload(updateAttributaireDto);
    delete payload.idsoumissionattribuee;
    const { data, error } = await this.supabaseService.client
      .from('Attributaire')
      .update(payload)
      .eq('idsoumissionattribuee', idSoumissionAttribuee)
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async remove(idSoumissionAttribuee: string) {
    const { data, error } = await this.supabaseService.client
      .from('Attributaire')
      .delete()
      .eq('idsoumissionattribuee', idSoumissionAttribuee);
    if (error) throw new Error(error.message);
    return data;
  }
}
