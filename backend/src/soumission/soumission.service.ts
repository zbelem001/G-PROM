import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSoumissionDto } from './dto/create-soumission.dto';

@Injectable()
export class SoumissionService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createSoumissionDto: CreateSoumissionDto) {
    const { data, error } = await this.supabaseService.client
      .from('Soumission')
      .insert([createSoumissionDto]);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Soumission').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findOne(idSoumission: string) {
    const { data, error } = await this.supabaseService.client
      .from('Soumission')
      .select('*')
      .eq('idSoumission', idSoumission)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(idSoumission: string, updateSoumissionDto: Partial<CreateSoumissionDto>) {
    const { data, error } = await this.supabaseService.client
      .from('Soumission')
      .update(updateSoumissionDto)
      .eq('idSoumission', idSoumission);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(idSoumission: string) {
    const { data, error } = await this.supabaseService.client
      .from('Soumission')
      .delete()
      .eq('idSoumission', idSoumission);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
