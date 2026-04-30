import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateLotDto } from './dto/create-lot.dto';

function normalizeLotPayload(lot: CreateLotDto): Record<string, unknown> {
  return {
    numblot: lot.numbLot,
    numbmarche: lot.numbMarche,
    description: lot.Description,
    numbcontrat: lot.numbContrat ?? null,
  };
}

function normalizeUpdateLotPayload(lot: Partial<CreateLotDto>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (lot.numbLot !== undefined) payload.numblot = lot.numbLot;
  if (lot.numbMarche !== undefined) payload.numbmarche = lot.numbMarche;
  if (lot.Description !== undefined) payload.description = lot.Description;
  if (lot.numbContrat !== undefined) payload.numbcontrat = lot.numbContrat;
  return payload;
}

@Injectable()
export class LotService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createLotDto: CreateLotDto) {
    const { data: existingLot, error: existsError } = await this.supabaseService.client
      .from('Lot')
      .select('numblot')
      .eq('numblot', createLotDto.numbLot)
      .maybeSingle();

    if (existsError) {
      throw new BadRequestException(existsError.message);
    }

    if (existingLot) {
      throw new BadRequestException(`Le numéro de lot ${createLotDto.numbLot} existe déjà.`);
    }

    const payload = normalizeLotPayload(createLotDto);
    const { data, error } = await this.supabaseService.client.from('Lot').insert([payload]);
    if (error) {
      throw new BadRequestException(error.message);
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
      .eq('numblot', numbLot)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(numbLot: string, updateLotDto: Partial<CreateLotDto>) {
    const payload = normalizeUpdateLotPayload(updateLotDto);
    const { data, error } = await this.supabaseService.client
      .from('Lot')
      .update(payload)
      .eq('numblot', numbLot);

    if (error) {
      throw new BadRequestException(error.message);
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
