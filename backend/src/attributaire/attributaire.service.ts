import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAttributaireDto } from './dto/create-attributaire.dto';

@Injectable()
export class AttributaireService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createAttributaireDto: CreateAttributaireDto) {
    const { data, error } = await this.supabaseService.client
      .from('Attributaire')
      .insert([createAttributaireDto]);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Attributaire').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findOne(idSoumissionAttribuee: string) {
    const { data, error } = await this.supabaseService.client
      .from('Attributaire')
      .select('*')
      .eq('idSoumissionAttribuee', idSoumissionAttribuee)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(idSoumissionAttribuee: string, updateAttributaireDto: Partial<CreateAttributaireDto>) {
    const { data, error } = await this.supabaseService.client
      .from('Attributaire')
      .update(updateAttributaireDto)
      .eq('idSoumissionAttribuee', idSoumissionAttribuee);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(idSoumissionAttribuee: string) {
    const { data, error } = await this.supabaseService.client
      .from('Attributaire')
      .delete()
      .eq('idSoumissionAttribuee', idSoumissionAttribuee);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
