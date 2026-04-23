import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';

@Injectable()
export class UtilisateurService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createUtilisateurDto: CreateUtilisateurDto) {
    const { data, error } = await this.supabaseService.client
      .from('Utilisateur')
      .insert([createUtilisateurDto]);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Utilisateur').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findOne(idUtilisateur: number) {
    const { data, error } = await this.supabaseService.client
      .from('Utilisateur')
      .select('*')
      .eq('idUtilisateur', idUtilisateur)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(idUtilisateur: number, updateUtilisateurDto: Partial<CreateUtilisateurDto>) {
    const { data, error } = await this.supabaseService.client
      .from('Utilisateur')
      .update(updateUtilisateurDto)
      .eq('idUtilisateur', idUtilisateur);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(idUtilisateur: number) {
    const { data, error } = await this.supabaseService.client
      .from('Utilisateur')
      .delete()
      .eq('idUtilisateur', idUtilisateur);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
