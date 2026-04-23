import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateLotDto } from './dto/create-lot.dto';

@Injectable()
export class LotService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createLotDto: CreateLotDto) {
    const { data, error } = await this.supabaseService.client.from('Lot').insert([createLotDto]);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Lot').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findOne(numbLot: string) {
    const { data, error } = await this.supabaseService.client
      .from('Lot')
      .select('*')
      .eq('numbLot', numbLot)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(numbLot: string, updateLotDto: Partial<CreateLotDto>) {
    const { data, error } = await this.supabaseService.client
      .from('Lot')
      .update(updateLotDto)
      .eq('numbLot', numbLot);

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(numbLot: string) {
    const { data, error } = await this.supabaseService.client
      .from('Lot')
      .delete()
      .eq('numbLot', numbLot);

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
