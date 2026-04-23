import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';

@Injectable()
export class FournisseurService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createFournisseurDto: CreateFournisseurDto) {
    const { data, error } = await this.supabaseService.client
      .from('Fournisseur')
      .insert([createFournisseurDto]);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Fournisseur').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findOne(idFournisseur: number) {
    const { data, error } = await this.supabaseService.client
      .from('Fournisseur')
      .select('*')
      .eq('idFournisseur', idFournisseur)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(idFournisseur: number, updateFournisseurDto: Partial<CreateFournisseurDto>) {
    const { data, error } = await this.supabaseService.client
      .from('Fournisseur')
      .update(updateFournisseurDto)
      .eq('idFournisseur', idFournisseur);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(idFournisseur: number) {
    const { data, error } = await this.supabaseService.client
      .from('Fournisseur')
      .delete()
      .eq('idFournisseur', idFournisseur);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
