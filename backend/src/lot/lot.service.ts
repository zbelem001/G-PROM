import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
import { CreateLotDto } from './dto/create-lot.dto';

function generateLotId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const rand = () => chars[Math.floor(Math.random() * chars.length)];
  return `L-${rand()}${rand()}${rand()}${rand()}`;
}

function normalizeLotPayload(lot: CreateLotDto, numblot: string): Record<string, unknown> {
  return {
    numblot,
    nomlot: lot.nomLot,
    numbmarche: lot.numbMarche,
    description: lot.Description,
    numbcontrat: lot.numbContrat ?? null,
  };
}

function normalizeUpdateLotPayload(lot: Partial<CreateLotDto>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (lot.nomLot !== undefined) payload.nomlot = lot.nomLot;
  if (lot.numbMarche !== undefined) payload.numbmarche = lot.numbMarche;
  if (lot.Description !== undefined) payload.description = lot.Description;
  if (lot.numbContrat !== undefined) payload.numbcontrat = lot.numbContrat;
  return payload;
}

@Injectable()
export class LotService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
  ) {}

  async create(createLotDto: CreateLotDto, userEmail?: string) {
    // Check uniqueness within the same market (not globally)
    const { data: existingLot, error: existsError } = await this.supabaseService.client
      .from('Lot')
      .select('numblot')
      .eq('nomlot', createLotDto.nomLot)
      .eq('numbmarche', createLotDto.numbMarche)
      .maybeSingle();

    if (existsError) {
      throw new BadRequestException(existsError.message);
    }

    if (existingLot) {
      throw new BadRequestException(
        `Un lot nommé "${createLotDto.nomLot}" existe déjà dans ce marché.`,
      );
    }

    // Generate a unique technical ID
    let numblot = generateLotId();
    let attempts = 0;
    while (attempts < 5) {
      const { data: conflict } = await this.supabaseService.client
        .from('Lot')
        .select('numblot')
        .eq('numblot', numblot)
        .maybeSingle();
      if (!conflict) break;
      numblot = generateLotId();
      attempts++;
    }

    const payload = this.auditService.stampCreate(normalizeLotPayload(createLotDto, numblot), userEmail);
    const { data, error } = await this.supabaseService.client.from('Lot').insert([payload]).select();
    if (error) {
      throw new BadRequestException(error.message);
    }
    await this.auditService.log('Lot', numblot, 'CREATE', userEmail, null, data?.[0]);
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

  async update(numbLot: string, updateLotDto: Partial<CreateLotDto>, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Lot').select('*').eq('numblot', numbLot).maybeSingle();
    const payload = this.auditService.stampUpdate(normalizeUpdateLotPayload(updateLotDto), userEmail);
    const { data, error } = await this.supabaseService.client
      .from('Lot')
      .update(payload)
      .eq('numblot', numbLot);

    if (error) {
      throw new BadRequestException(error.message);
    }
    await this.auditService.log('Lot', numbLot, 'UPDATE', userEmail, existing.data, payload);
    return data;
  }

  async remove(numbLot: string, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Lot').select('*').eq('numblot', numbLot).maybeSingle();
    const { data, error } = await this.supabaseService.client
      .from('Lot')
      .delete()
      .eq('numblot', numbLot);

    if (error) {
      throw new Error(error.message);
    }
    await this.auditService.log('Lot', numbLot, 'DELETE', userEmail, existing.data, null);
    return data;
  }
}
