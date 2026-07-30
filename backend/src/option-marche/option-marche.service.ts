import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateOptionMarcheDto } from './dto/create-option-marche.dto';

@Injectable()
export class OptionMarcheService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(categorie?: string) {
    let query = this.supabaseService.client.from('OptionMarche').select('*').order('valeur', { ascending: true });
    if (categorie) {
      query = query.eq('categorie', categorie);
    }
    const { data, error } = await query;
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return data ?? [];
  }

  async create(dto: CreateOptionMarcheDto) {
    const { data, error } = await this.supabaseService.client
      .from('OptionMarche')
      .insert([{ categorie: dto.categorie, valeur: dto.valeur }])
      .select()
      .single();
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async remove(id: number) {
    const { error } = await this.supabaseService.client.from('OptionMarche').delete().eq('id', id);
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return { success: true };
  }
}
