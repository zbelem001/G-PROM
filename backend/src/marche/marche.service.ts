import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMarcheDto } from './dto/create-marche.dto';

@Injectable()
export class MarcheService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createMarcheDto: CreateMarcheDto) {
    const { data, error } = await this.supabaseService.client
      .from('Marche')
      .insert([createMarcheDto]);

    if (error) {
      throw new Error(error.message);
    }

    return data;
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
      .eq('numbMarche', numbMarche)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(numbMarche: string, updateMarcheDto: Partial<CreateMarcheDto>) {
    const { data, error } = await this.supabaseService.client
      .from('Marche')
      .update(updateMarcheDto)
      .eq('numbMarche', numbMarche);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async remove(numbMarche: string) {
    const { data, error } = await this.supabaseService.client
      .from('Marche')
      .delete()
      .eq('numbMarche', numbMarche);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
