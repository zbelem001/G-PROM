import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAvenantDto } from './dto/create-avenant.dto';

@Injectable()
export class AvenantService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createAvenantDto: CreateAvenantDto) {
    const { data, error } = await this.supabaseService.client
      .from('Avenant')
      .insert([createAvenantDto]);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Avenant').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findOne(idAvenant: number) {
    const { data, error } = await this.supabaseService.client
      .from('Avenant')
      .select('*')
      .eq('idAvenant', idAvenant)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(idAvenant: number, updateAvenantDto: Partial<CreateAvenantDto>) {
    const { data, error } = await this.supabaseService.client
      .from('Avenant')
      .update(updateAvenantDto)
      .eq('idAvenant', idAvenant);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(idAvenant: number) {
    const { data, error } = await this.supabaseService.client
      .from('Avenant')
      .delete()
      .eq('idAvenant', idAvenant);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
