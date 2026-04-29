import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';

@Injectable()
export class FournisseurService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createFournisseurDto: CreateFournisseurDto) {
    const { data, error } = await this.supabaseService.client
      .from('Fournisseur')
      .insert([createFournisseurDto]);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Fournisseur').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findOne(idFournisseur: number) {
    const { data, error } = await this.supabaseService.client
      .from('Fournisseur')
      .select('*')
      .eq('idfournisseur', idFournisseur)
      .single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async findDetails(idFournisseur: number) {
    const fournisseur = await this.findOne(idFournisseur);

    const { data: soumissionsData, error: soumissionsError } = await this.supabaseService.client
      .from('Soumission')
      .select('*')
      .eq('idfournisseur', idFournisseur);
    if (soumissionsError) {
      throw new Error(soumissionsError.message);
    }

    const lots = (soumissionsData ?? []).map((soumission: any) => soumission.numbLot).filter(Boolean);
    const lotQuery = lots.length
      ? await this.supabaseService.client.from('Lot').select('*').in('numbLot', lots)
      : { data: [], error: null };
    if (lotQuery.error) {
      throw new Error(lotQuery.error.message);
    }

    const documentQuery = lots.length
      ? await this.supabaseService.client.from('Document').select('*').in('numbLot', lots)
      : { data: [], error: null };
    if (documentQuery.error) {
      throw new Error(documentQuery.error.message);
    }

    const lotByNumbLot = new Map<string, any>((lotQuery.data ?? []).map((lot: any) => [String(lot.numbLot), lot] as [string, any]));
    const soumissions = (soumissionsData ?? []).map((soumission: any) => ({
      ...soumission,
      lotDescription: lotByNumbLot.get(String(soumission.numbLot))?.Description,
      numbMarche: lotByNumbLot.get(String(soumission.numbLot))?.numbMarche,
    }));

    return {
      fournisseur,
      soumissions,
      documents: documentQuery.data ?? [],
    };
  }

  async update(idFournisseur: number, updateFournisseurDto: Partial<CreateFournisseurDto>) {
    const { data, error } = await this.supabaseService.client
      .from('Fournisseur')
      .update(updateFournisseurDto)
      .eq('idfournisseur', idFournisseur);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(idFournisseur: number) {
    const { data, error } = await this.supabaseService.client
      .from('Fournisseur')
      .delete()
      .eq('idfournisseur', idFournisseur);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
