import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
import { MarcheStatusService } from '../marche-status/marche-status.service';
import { CreateDocumentDto } from './dto/create-document.dto';

function normalizeDocPayload(dto: Partial<CreateDocumentDto>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (dto.numbLot !== undefined) payload.numblot = dto.numbLot;
  if (dto.PV_ouverture !== undefined) payload.pv_ouverture = dto.PV_ouverture || null;
  if (dto.RapportAnalyse !== undefined) payload.rapportanalyse = dto.RapportAnalyse || null;
  if (dto.PV_attribution !== undefined) payload.pv_attribution = dto.PV_attribution || null;
  if (dto.Notification !== undefined) payload.notification = dto.Notification || null;
  if (dto.Contrat !== undefined) payload.contrat = dto.Contrat || null;
  if (dto.FED !== undefined) payload.fed = dto.FED || null;
  if (dto.BonCommande !== undefined) payload.boncommande = dto.BonCommande || null;
  if (dto.Avenant !== undefined) payload.avenant = dto.Avenant || null;
  if (dto.OrdreService !== undefined) payload.ordreservice = dto.OrdreService || null;
  if (dto.PV_reception_tech !== undefined) payload.pv_reception_tech = dto.PV_reception_tech || null;
  if (dto.PV_reception_prov !== undefined) payload.pv_reception_prov = dto.PV_reception_prov || null;
  if (dto.PV_reception_def !== undefined) payload.pv_reception_def = dto.PV_reception_def || null;
  return payload;
}

@Injectable()
export class DocumentService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
    private readonly marcheStatusService: MarcheStatusService,
  ) {}

  async create(createDocumentDto: CreateDocumentDto, userEmail?: string) {
    const payload = this.auditService.stampCreate(normalizeDocPayload(createDocumentDto), userEmail);
    const { data, error } = await this.supabaseService.client
      .from('Document')
      .insert([payload])
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    await this.auditService.log('Document', (payload.numblot as string) ?? '', 'CREATE', userEmail, null, data);
    await this.syncMarcheStatus(payload.numblot as string, payload.pv_reception_def);
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Document').select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(numbLot: string) {
    const { data, error } = await this.supabaseService.client
      .from('Document')
      .select('*')
      .eq('numblot', numbLot)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async update(numbLot: string, updateDocumentDto: Partial<CreateDocumentDto>, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Document').select('*').eq('numblot', numbLot).maybeSingle();
    const payload = this.auditService.stampUpdate(normalizeDocPayload(updateDocumentDto), userEmail);
    delete payload.numblot;
    const { data, error } = await this.supabaseService.client
      .from('Document')
      .update(payload)
      .eq('numblot', numbLot)
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    await this.auditService.log('Document', numbLot, 'UPDATE', userEmail, existing.data, data);
    await this.syncMarcheStatus(numbLot, payload.pv_reception_def);
    return data;
  }

  async upsert(numbLot: string, updateDocumentDto: Partial<CreateDocumentDto>, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Document').select('*').eq('numblot', numbLot).maybeSingle();
    const basePayload = normalizeDocPayload({ numbLot, ...updateDocumentDto });
    const payload = existing.data
      ? this.auditService.stampUpdate(basePayload, userEmail)
      : this.auditService.stampCreate(basePayload, userEmail);
    const { data, error } = await this.supabaseService.client
      .from('Document')
      .upsert(payload, { onConflict: 'numblot' })
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    await this.auditService.log('Document', numbLot, existing.data ? 'UPDATE' : 'CREATE', userEmail, existing.data, data);
    await this.syncMarcheStatus(numbLot, payload.pv_reception_def);
    return data;
  }

  async remove(numbLot: string, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Document').select('*').eq('numblot', numbLot).maybeSingle();
    const { data, error } = await this.supabaseService.client
      .from('Document')
      .delete()
      .eq('numblot', numbLot);
    if (error) throw new Error(error.message);
    await this.auditService.log('Document', numbLot, 'DELETE', userEmail, existing.data, null);
    return data;
  }

  // The définitive réception PV is what finally releases the provider from its
  // obligations — that's the signal that closes the marché out entirely.
  private async syncMarcheStatus(numbLot: string, pvReceptionDef: unknown): Promise<void> {
    if (typeof pvReceptionDef === 'string' && pvReceptionDef.trim() !== '') {
      await this.marcheStatusService.advanceForLot(numbLot, 'Clôturé');
    }
  }
}
