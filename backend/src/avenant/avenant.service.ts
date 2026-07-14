import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
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
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createAvenantDto: CreateAvenantDto) {
    const payload = normalizeKeys(createAvenantDto);
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
    const payload = normalizeKeys(updateAvenantDto);
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
