import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Injectable()
export class ConsultationService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createConsultationDto: CreateConsultationDto) {
    // Determine the exact keys sent from frontend
    // Use fallback to handle both CamelCase and lowercase incoming properties
    const numbLot = createConsultationDto.numbLot || (createConsultationDto as any).numblot;
    const idFournisseur = createConsultationDto.idFournisseur || (createConsultationDto as any).idfournisseur;
    const DateConsultation = createConsultationDto.DateConsultation || (createConsultationDto as any).dateconsultation;

    // Supabase columns are lowercase: numblot, idfournisseur, dateconsultation
    const payload = {
      numblot: String(numbLot),
      idfournisseur: Number(idFournisseur),
      dateconsultation: DateConsultation || new Date().toISOString().split('T')[0]
    };

    console.log('[ConsultationService] Final payload for Supabase:', payload);

    if (!payload.numblot || isNaN(payload.idfournisseur)) {
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

  async update(numbLot: string, idFournisseur: number, updateConsultationDto: Partial<CreateConsultationDto>) {
    const payload: any = {};
    if (updateConsultationDto.numbLot) payload.numblot = updateConsultationDto.numbLot;
    if (updateConsultationDto.idFournisseur) payload.idfournisseur = updateConsultationDto.idFournisseur;
    if (updateConsultationDto.DateConsultation) payload.dateconsultation = updateConsultationDto.DateConsultation;

    const { data, error } = await this.supabaseService.client
      .from('Consultation')
      .update(payload)
      .eq('numblot', numbLot)
      .eq('idfournisseur', idFournisseur)
      .select();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(numbLot: string, idFournisseur: number) {
    const { data, error } = await this.supabaseService.client
      .from('Consultation')
      .delete()
      .eq('numblot', numbLot)
      .eq('idfournisseur', idFournisseur);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
