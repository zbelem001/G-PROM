import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSoumissionDto } from './dto/create-soumission.dto';

@Injectable()
export class SoumissionService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createSoumissionDto: CreateSoumissionDto) {
    // Normalization to lowercase keys for Supabase compatibility
    const payload = {
      idsoumission: createSoumissionDto.idSoumission,
      numblot: createSoumissionDto.numbLot,
      idfournisseur: Number(createSoumissionDto.idFournisseur),
      datedepot: createSoumissionDto.DateDepot,
      heure: createSoumissionDto.Heure,
      observation: createSoumissionDto.Observation,
      delaiexecutionprev: createSoumissionDto.DelaiExecutionPrev ? Number(createSoumissionDto.DelaiExecutionPrev) : null,
      montantprev: createSoumissionDto.MontantPrev ? Number(createSoumissionDto.MontantPrev) : null,
      nbexemplaire: createSoumissionDto.nbExemplaire ? Number(createSoumissionDto.nbExemplaire) : null,
      devise: createSoumissionDto.Devise ?? 'XOF',
    };

    console.log('[SoumissionService] Final payload for Supabase:', payload);

    const { data, error } = await this.supabaseService.client
      .from('Soumission')
      .insert([payload])
      .select();

    if (error) {
      console.error('[SoumissionService] Supabase insert error:', error);
      throw new Error(`Supabase error [${error.code}]: ${error.message}`);
    }
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Soumission').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findOne(idSoumission: string) {
    const { data, error } = await this.supabaseService.client
      .from('Soumission')
      .select('*')
      .eq('idsoumission', idSoumission)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(idSoumission: string, updateSoumissionDto: Partial<CreateSoumissionDto>) {
    const payload: any = {};
    if (updateSoumissionDto.idSoumission) payload.idsoumission = updateSoumissionDto.idSoumission;
    if (updateSoumissionDto.numbLot) payload.numblot = updateSoumissionDto.numbLot;
    if (updateSoumissionDto.idFournisseur) payload.idfournisseur = Number(updateSoumissionDto.idFournisseur);
    if (updateSoumissionDto.DateDepot) payload.datedepot = updateSoumissionDto.DateDepot;
    if (updateSoumissionDto.Heure) payload.heure = updateSoumissionDto.Heure;
    if (updateSoumissionDto.Observation) payload.observation = updateSoumissionDto.Observation;
    if (updateSoumissionDto.DelaiExecutionPrev) payload.delaiexecutionprev = Number(updateSoumissionDto.DelaiExecutionPrev);
    if (updateSoumissionDto.MontantPrev) payload.montantprev = Number(updateSoumissionDto.MontantPrev);
    if (updateSoumissionDto.nbExemplaire) payload.nbexemplaire = Number(updateSoumissionDto.nbExemplaire);

    const { data, error } = await this.supabaseService.client
      .from('Soumission')
      .update(payload)
      .eq('idsoumission', idSoumission)
      .select();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(idSoumission: string) {
    const { data, error } = await this.supabaseService.client
      .from('Soumission')
      .delete()
      .eq('idsoumission', idSoumission);

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
