import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Injectable()
export class ConsultationService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createConsultationDto: CreateConsultationDto) {
    const payload: any = {};
    if (createConsultationDto.numbLot) payload.numblot = createConsultationDto.numbLot;
    if (createConsultationDto.idFournisseur) payload.idfournisseur = createConsultationDto.idFournisseur;
    if (createConsultationDto.DateConsultation) payload.dateconsultation = createConsultationDto.DateConsultation;

    const { data, error } = await this.supabaseService.client
      .from('Consultation')
      .insert([payload])
      .select();

    if (error) {
      console.error('[ConsultationService] Supabase insert error:', error);
      throw new Error(error.message);
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
