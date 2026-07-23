import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class HistoriqueConnexionService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async record(idutilisateur: number, ipaddress: string | null, useragent: string | null) {
    const { error } = await this.supabaseService.client
      .from('HistoriqueConnexion')
      .insert([{ idutilisateur, ipaddress, useragent }]);
    if (error) {
      // A failed history write must never block a successful login.
      console.error('HistoriqueConnexionService.record error:', error.message);
    }
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client
      .from('HistoriqueConnexion')
      .select('*')
      .order('dateconnexion', { ascending: false })
      .limit(200);
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return data ?? [];
  }
}
