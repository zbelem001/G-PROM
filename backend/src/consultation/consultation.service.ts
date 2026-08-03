import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
import { MarcheStatusService } from '../marche-status/marche-status.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Injectable()
export class ConsultationService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
    private readonly marcheStatusService: MarcheStatusService,
  ) {}

  async create(createConsultationDto: CreateConsultationDto, userEmail?: string) {
    // Determine the exact keys sent from frontend
    // Use fallback to handle both CamelCase and lowercase incoming properties
    const numbLot = createConsultationDto.numbLot || (createConsultationDto as any).numblot;
    const idFournisseur = createConsultationDto.idFournisseur || (createConsultationDto as any).idfournisseur;
    const DateConsultation = createConsultationDto.DateConsultation || (createConsultationDto as any).dateconsultation;

    await this.marcheStatusService.assertReadyForReception(String(numbLot));

    // Supabase columns are lowercase: numblot, idfournisseur, dateconsultation
    const payload = this.auditService.stampCreate(
      {
        numblot: String(numbLot),
        idfournisseur: Number(idFournisseur),
        dateconsultation: DateConsultation || new Date().toISOString().split('T')[0],
      },
      userEmail,
    );

    console.log('[ConsultationService] Final payload for Supabase:', payload);

    if (!payload.numblot || isNaN(payload.idfournisseur as number)) {
      throw new Error(`Invalid data: numblot=${payload.numblot}, idfournisseur=${payload.idfournisseur}`);
    }

    const { data, error } = await this.supabaseService.client
      .from('Consultation')
      .insert([payload])
      .select();

    if (error) {
      console.error('[ConsultationService] Supabase insert error:', error);
      throw new Error(`Supabase error [${error.code}]: ${error.message}`);
    }
    await this.auditService.log('Consultation', `${payload.numblot}/${payload.idfournisseur}`, 'CREATE', userEmail, null, data?.[0]);
    await this.marcheStatusService.advanceForLot(payload.numblot as string, 'Réception');
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Consultation').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findOne(numbLot: string, idFournisseur: number) {
    const { data, error } = await this.supabaseService.client
      .from('Consultation')
      .select('*')
      .eq('numblot', numbLot)
      .eq('idfournisseur', idFournisseur)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(numbLot: string, idFournisseur: number, updateConsultationDto: Partial<CreateConsultationDto>, userEmail?: string) {
    const existing = await this.supabaseService.client
      .from('Consultation')
      .select('*')
      .eq('numblot', numbLot)
      .eq('idfournisseur', idFournisseur)
      .maybeSingle();

    const rawPayload: any = {};
    if (updateConsultationDto.numbLot) rawPayload.numblot = updateConsultationDto.numbLot;
    if (updateConsultationDto.idFournisseur) rawPayload.idfournisseur = updateConsultationDto.idFournisseur;
    if (updateConsultationDto.DateConsultation) rawPayload.dateconsultation = updateConsultationDto.DateConsultation;
    const payload = this.auditService.stampUpdate(rawPayload, userEmail);

    const { data, error } = await this.supabaseService.client
      .from('Consultation')
      .update(payload)
      .eq('numblot', numbLot)
      .eq('idfournisseur', idFournisseur)
      .select();

    if (error) {
      throw new Error(error.message);
    }
    await this.auditService.log('Consultation', `${numbLot}/${idFournisseur}`, 'UPDATE', userEmail, existing.data, data?.[0]);
    return data;
  }

  async remove(numbLot: string, idFournisseur: number, userEmail?: string) {
    const existing = await this.supabaseService.client
      .from('Consultation')
      .select('*')
      .eq('numblot', numbLot)
      .eq('idfournisseur', idFournisseur)
      .maybeSingle();

    const { data, error } = await this.supabaseService.client
      .from('Consultation')
      .delete()
      .eq('numblot', numbLot)
      .eq('idfournisseur', idFournisseur);
    if (error) {
      throw new Error(error.message);
    }
    await this.auditService.log('Consultation', `${numbLot}/${idFournisseur}`, 'DELETE', userEmail, existing.data, null);
    return data;
  }
}
