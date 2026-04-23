import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAnalyseDto } from './dto/create-analyse.dto';

@Injectable()
export class AnalyseService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createAnalyseDto: CreateAnalyseDto) {
    const { data, error } = await this.supabaseService.client
      .from('Analyse')
      .insert([createAnalyseDto]);
    if (error) {
      throw new Error(error.message);
    }
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
      .eq('numbLot', numbLot)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(numbLot: string, updateAnalyseDto: Partial<CreateAnalyseDto>) {
    const { data, error } = await this.supabaseService.client
      .from('Analyse')
      .update(updateAnalyseDto)
      .eq('numbLot', numbLot);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(numbLot: string) {
    const { data, error } = await this.supabaseService.client
      .from('Analyse')
      .delete()
      .eq('numbLot', numbLot);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
