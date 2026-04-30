import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMarcheDto } from './dto/create-marche.dto';

@Injectable()
export class MarcheService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createMarcheDto: CreateMarcheDto) {
    const payload = Object.entries(createMarcheDto).reduce((normalized, [key, value]) => {
      const lowerKey = key.replace(/([A-Z])/g, (match) => match.toLowerCase());
      normalized[lowerKey] = value;
      return normalized;
    }, {} as Record<string, unknown>);

    try {
      const { data, error } = await this.supabaseService.client
        .from('Marche')
        .insert([payload])
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw new InternalServerErrorException(error.message);
      }

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

  async update(numbMarche: string, updateMarcheDto: Partial<CreateMarcheDto>) {
    const { data, error } = await this.supabaseService.client
      .from('Marche')
      .update(updateMarcheDto)
      .eq('numbmarche', numbMarche);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async remove(numbMarche: string) {
    const { data, error } = await this.supabaseService.client
      .from('Marche')
      .delete()
      .eq('numbmarche', numbMarche);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
