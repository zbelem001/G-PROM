import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateBailleurDto } from './dto/create-bailleur.dto';

@Injectable()
export class BailleurService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private normalizeKeys(dto: object): Record<string, unknown> {
    return Object.entries(dto).reduce((normalized, [key, value]) => {
      const lowerKey = key.replace(/([A-Z])/g, (match) => match.toLowerCase());
      normalized[lowerKey] = value;
      return normalized;
    }, {} as Record<string, unknown>);
  }

  private normalizeBailleur(raw: any): any {
    if (!raw) return raw;
    return {
      idBailleur: raw.idbailleur ?? raw.idBailleur,
      nomBailleur: raw.nombailleur ?? raw.nomBailleur,
    };
  }

  async create(createBailleurDto: CreateBailleurDto) {
    const payload = this.normalizeKeys(createBailleurDto);
    const { data, error } = await this.supabaseService.client
      .from('Bailleur')
      .insert([payload])
      .select()
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return this.normalizeBailleur(data);
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client
      .from('Bailleur')
      .select('*')
      .order('nombailleur', { ascending: true });
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []).map((row: any) => this.normalizeBailleur(row));
  }

  async findOne(idBailleur: number) {
    const { data, error } = await this.supabaseService.client
      .from('Bailleur')
      .select('*')
      .eq('idbailleur', idBailleur)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return this.normalizeBailleur(data);
  }

  async update(idBailleur: number, updateBailleurDto: Partial<CreateBailleurDto>) {
    const payload = this.normalizeKeys(updateBailleurDto);
    const { data, error } = await this.supabaseService.client
      .from('Bailleur')
      .update(payload)
      .eq('idbailleur', idBailleur)
      .select()
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return this.normalizeBailleur(data);
  }

  async remove(idBailleur: number) {
    const { error } = await this.supabaseService.client.from('Bailleur').delete().eq('idbailleur', idBailleur);
    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  }
}
