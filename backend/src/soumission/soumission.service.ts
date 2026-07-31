import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
import { CreateSoumissionDto } from './dto/create-soumission.dto';

@Injectable()
export class SoumissionService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
  ) {}

  async create(createSoumissionDto: CreateSoumissionDto, userEmail?: string) {
    // Normalization to lowercase keys for Supabase compatibility
    const payload = this.auditService.stampCreate(
      {
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
      },
      userEmail,
    );

    console.log('[SoumissionService] Final payload for Supabase:', payload);

    const { data, error } = await this.supabaseService.client
      .from('Soumission')
      .insert([payload])
      .select();

    if (error) {
      console.error('[SoumissionService] Supabase insert error:', error);
      throw new Error(`Supabase error [${error.code}]: ${error.message}`);
    }
    await this.auditService.log('Soumission', data?.[0]?.idsoumission ?? '', 'CREATE', userEmail, null, data?.[0]);
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

  async update(idSoumission: string, updateSoumissionDto: Partial<CreateSoumissionDto>, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Soumission').select('*').eq('idsoumission', idSoumission).maybeSingle();

    const rawPayload: any = {};
    if (updateSoumissionDto.idSoumission) rawPayload.idsoumission = updateSoumissionDto.idSoumission;
    if (updateSoumissionDto.numbLot) rawPayload.numblot = updateSoumissionDto.numbLot;
    if (updateSoumissionDto.idFournisseur) rawPayload.idfournisseur = Number(updateSoumissionDto.idFournisseur);
    if (updateSoumissionDto.DateDepot) rawPayload.datedepot = updateSoumissionDto.DateDepot;
    if (updateSoumissionDto.Heure) rawPayload.heure = updateSoumissionDto.Heure;
    if (updateSoumissionDto.Observation) rawPayload.observation = updateSoumissionDto.Observation;
    if (updateSoumissionDto.DelaiExecutionPrev) rawPayload.delaiexecutionprev = Number(updateSoumissionDto.DelaiExecutionPrev);
    if (updateSoumissionDto.MontantPrev) rawPayload.montantprev = Number(updateSoumissionDto.MontantPrev);
    if (updateSoumissionDto.nbExemplaire) rawPayload.nbexemplaire = Number(updateSoumissionDto.nbExemplaire);
    const payload = this.auditService.stampUpdate(rawPayload, userEmail);

    const { data, error } = await this.supabaseService.client
      .from('Soumission')
      .update(payload)
      .eq('idsoumission', idSoumission)
      .select();

    if (error) {
      throw new Error(error.message);
    }
    await this.auditService.log('Soumission', idSoumission, 'UPDATE', userEmail, existing.data, data?.[0]);
    return data;
  }

  async remove(idSoumission: string, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Soumission').select('*').eq('idsoumission', idSoumission).maybeSingle();

    const { data, error } = await this.supabaseService.client
      .from('Soumission')
      .delete()
      .eq('idsoumission', idSoumission);

    if (error) {
      throw new Error(error.message);
    }
    await this.auditService.log('Soumission', idSoumission, 'DELETE', userEmail, existing.data, null);
    return data;
  }
}
