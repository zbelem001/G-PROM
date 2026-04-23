import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Injectable()
export class ConsultationService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createConsultationDto: CreateConsultationDto) {
    const { data, error } = await this.supabaseService.client
      .from('Consultation')
      .insert([createConsultationDto]);
    if (error) {
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
      .eq('numbLot', numbLot)
      .eq('idFournisseur', idFournisseur)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(numbLot: string, idFournisseur: number, updateConsultationDto: Partial<CreateConsultationDto>) {
    const { data, error } = await this.supabaseService.client
      .from('Consultation')
      .update(updateConsultationDto)
      .eq('numbLot', numbLot)
      .eq('idFournisseur', idFournisseur);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(numbLot: string, idFournisseur: number) {
    const { data, error } = await this.supabaseService.client
      .from('Consultation')
      .delete()
      .eq('numbLot', numbLot)
      .eq('idFournisseur', idFournisseur);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
