import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAvenantDto } from './dto/create-avenant.dto';

function normalizePayload(dto: Partial<CreateAvenantDto>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (dto.idSoumissionAttribuee !== undefined) payload.idsoumissionattribuee = dto.idSoumissionAttribuee;
  if (dto.numbAvenant !== undefined) payload.numbavenant = dto.numbAvenant ? Number(dto.numbAvenant) : null;
  if (dto.MontantAvenant !== undefined) payload.montantavenant = dto.MontantAvenant ? Number(dto.MontantAvenant) : null;
  if (dto.DateProrogation !== undefined) payload.dateprorogation = dto.DateProrogation || null;
  return payload;
}

@Injectable()
export class AvenantService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createAvenantDto: CreateAvenantDto) {
    const payload = normalizePayload(createAvenantDto);
    const { data, error } = await this.supabaseService.client
      .from('Avenant')
      .insert([payload])
      .select()
      .single();
    if (error) throw new Error(error.message);
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

  async update(idAvenant: number, updateAvenantDto: Partial<CreateAvenantDto>) {
    const payload = normalizePayload(updateAvenantDto);
    const { data, error } = await this.supabaseService.client
      .from('Avenant')
      .update(payload)
      .eq('idavenant', idAvenant)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async remove(idAvenant: number) {
    const { data, error } = await this.supabaseService.client
      .from('Avenant')
      .delete()
      .eq('idavenant', idAvenant);
    if (error) throw new Error(error.message);
    return data;
  }
}
