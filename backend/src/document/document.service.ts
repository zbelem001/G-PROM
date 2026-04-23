import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createDocumentDto: CreateDocumentDto) {
    const { data, error } = await this.supabaseService.client
      .from('Document')
      .insert([createDocumentDto]);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Document').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findOne(numbLot: string) {
    const { data, error } = await this.supabaseService.client
      .from('Document')
      .select('*')
      .eq('numbLot', numbLot)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(numbLot: string, updateDocumentDto: Partial<CreateDocumentDto>) {
    const { data, error } = await this.supabaseService.client
      .from('Document')
      .update(updateDocumentDto)
      .eq('numbLot', numbLot);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(numbLot: string) {
    const { data, error } = await this.supabaseService.client
      .from('Document')
      .delete()
      .eq('numbLot', numbLot);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
