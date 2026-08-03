import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
import { MarcheStatusService } from '../marche-status/marche-status.service';
import { CreateAttributaireDto } from './dto/create-attributaire.dto';

function normalizePayload(dto: Partial<CreateAttributaireDto>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (dto.idSoumissionAttribuee !== undefined) payload.idsoumissionattribuee = dto.idSoumissionAttribuee;
  if (dto.MontantEffec !== undefined) payload.montanteffec = dto.MontantEffec ? Number(dto.MontantEffec) : null;
  if (dto.DelaiExecutionEffec !== undefined) payload.delaiexecutioneffec = dto.DelaiExecutionEffec ? Number(dto.DelaiExecutionEffec) : null;
  if (dto.DateDemarage !== undefined) payload.datedemarage = dto.DateDemarage || null;
  if (dto.DatePrevFin !== undefined) payload.dateprevfin = dto.DatePrevFin || null;
  if (dto.Observation !== undefined) payload.observation = dto.Observation || null;
  if (dto.Statut !== undefined) payload.statut = dto.Statut || null;
  return payload;
}

@Injectable()
export class AttributaireService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
    private readonly marcheStatusService: MarcheStatusService,
  ) {}

  async create(createAttributaireDto: CreateAttributaireDto, userEmail?: string) {
    const payload = this.auditService.stampCreate(normalizePayload(createAttributaireDto), userEmail);
    const { data, error } = await this.supabaseService.client
      .from('Attributaire')
      .insert([payload])
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    await this.auditService.log('Attributaire', (payload.idsoumissionattribuee as string) ?? '', 'CREATE', userEmail, null, data);
    await this.syncMarcheStatus(payload.idsoumissionattribuee as string, payload.statut);
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Attributaire').select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(idSoumissionAttribuee: string) {
    const { data, error } = await this.supabaseService.client
      .from('Attributaire')
      .select('*')
      .eq('idsoumissionattribuee', idSoumissionAttribuee)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async update(idSoumissionAttribuee: string, updateAttributaireDto: Partial<CreateAttributaireDto>, userEmail?: string) {
    const existing = await this.supabaseService.client
      .from('Attributaire')
      .select('*')
      .eq('idsoumissionattribuee', idSoumissionAttribuee)
      .maybeSingle();
    const payload = this.auditService.stampUpdate(normalizePayload(updateAttributaireDto), userEmail);
    delete payload.idsoumissionattribuee;
    const { data, error } = await this.supabaseService.client
      .from('Attributaire')
      .update(payload)
      .eq('idsoumissionattribuee', idSoumissionAttribuee)
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    await this.auditService.log('Attributaire', idSoumissionAttribuee, 'UPDATE', userEmail, existing.data, data);
    if (updateAttributaireDto.Statut !== undefined) {
      await this.syncMarcheStatus(idSoumissionAttribuee, payload.statut);
    }
    return data;
  }

  // Attribution reaching its default statut means the marché moves to "En cours";
  // reaching "Terminé" means the marché is fully "Exécuté" (see MarcheStatusService).
  private async syncMarcheStatus(idSoumissionAttribuee: string, statut: unknown): Promise<void> {
    await this.marcheStatusService.advanceForSoumission(idSoumissionAttribuee, 'En cours');
    if (statut === 'Terminé') {
      await this.marcheStatusService.advanceForSoumission(idSoumissionAttribuee, 'Exécuté');
    }
  }

  async remove(idSoumissionAttribuee: string, userEmail?: string) {
    const existing = await this.supabaseService.client
      .from('Attributaire')
      .select('*')
      .eq('idsoumissionattribuee', idSoumissionAttribuee)
      .maybeSingle();
    const { data, error } = await this.supabaseService.client
      .from('Attributaire')
      .delete()
      .eq('idsoumissionattribuee', idSoumissionAttribuee);
    if (error) throw new Error(error.message);
    await this.auditService.log('Attributaire', idSoumissionAttribuee, 'DELETE', userEmail, existing.data, null);
    return data;
  }
}
