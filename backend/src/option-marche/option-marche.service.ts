import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
import { CreateOptionMarcheDto } from './dto/create-option-marche.dto';

@Injectable()
export class OptionMarcheService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
  ) {}

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

  async create(dto: CreateOptionMarcheDto, userEmail?: string) {
    const payload = this.auditService.stampCreate({ categorie: dto.categorie, valeur: dto.valeur }, userEmail);
    const { data, error } = await this.supabaseService.client
      .from('OptionMarche')
      .insert([payload])
      .select()
      .single();
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    await this.auditService.log('OptionMarche', data?.id ?? '', 'CREATE', userEmail, null, data);
    return data;
  }

  async remove(id: number, userEmail?: string) {
    const existing = await this.supabaseService.client.from('OptionMarche').select('*').eq('id', id).maybeSingle();
    const { error } = await this.supabaseService.client.from('OptionMarche').delete().eq('id', id);
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    await this.auditService.log('OptionMarche', id, 'DELETE', userEmail, existing.data, null);
    return { success: true };
  }
}
