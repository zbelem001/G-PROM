import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
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
  return payload;
}

@Injectable()
export class DocumentService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createDocumentDto: CreateDocumentDto) {
    const payload = normalizeDocPayload(createDocumentDto);
    const { data, error } = await this.supabaseService.client
      .from('Document')
      .insert([payload])
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
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

  async update(numbLot: string, updateDocumentDto: Partial<CreateDocumentDto>) {
    const payload = normalizeDocPayload(updateDocumentDto);
    delete payload.numblot;
    const { data, error } = await this.supabaseService.client
      .from('Document')
      .update(payload)
      .eq('numblot', numbLot)
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async upsert(numbLot: string, updateDocumentDto: Partial<CreateDocumentDto>) {
    const payload = normalizeDocPayload({ numbLot, ...updateDocumentDto });
    const { data, error } = await this.supabaseService.client
      .from('Document')
      .upsert(payload, { onConflict: 'numblot' })
      .select()
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async remove(numbLot: string) {
    const { data, error } = await this.supabaseService.client
      .from('Document')
      .delete()
      .eq('numblot', numbLot);
    if (error) throw new Error(error.message);
    return data;
  }
}
