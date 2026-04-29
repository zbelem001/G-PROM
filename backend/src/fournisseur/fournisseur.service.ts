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
    return this.normalizeFournisseur(data);
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

    const lotKeys = (soumissionsData ?? []).map((soumission: any) => soumission.numbLot).filter(Boolean);
    const lotQuery = lotKeys.length
      ? await this.supabaseService.client.from('Lot').select('*').in('numbLot', lotKeys)
      : { data: [], error: null };
    if (lotQuery.error) {
      throw new Error(lotQuery.error.message);
    }

    const documentQuery = lotKeys.length
      ? await this.supabaseService.client.from('Document').select('*').in('numbLot', lotKeys)
      : { data: [], error: null };
    if (documentQuery.error) {
      throw new Error(documentQuery.error.message);
    }

    const normalizedLots = (lotQuery.data ?? []).map((lot: any) => this.normalizeLot(lot));
    const lotByNumbLot = new Map<string, any>(normalizedLots.map((lot: any) => [String(lot.numbLot), lot] as [string, any]));
    const soumissions = (soumissionsData ?? []).map((soumission: any) => {
      const normalizedSoumission = this.normalizeSoumission(soumission);
      return {
        ...normalizedSoumission,
        lotDescription: lotByNumbLot.get(String(normalizedSoumission.numbLot))?.Description,
        numbMarche: lotByNumbLot.get(String(normalizedSoumission.numbLot))?.numbMarche,
      };
    });

    const documents = (documentQuery.data ?? []).map((doc: any) => this.normalizeDocument(doc));

    return {
      fournisseur,
      soumissions,
      documents,
    };
  }

  private normalizeFournisseur(raw: any): any {
    if (!raw) return raw;
    return {
      idFournisseur: raw.idfournisseur ?? raw.idFournisseur,
      RaisonSocial: raw.raisonsocial ?? raw.RaisonSocial,
      FormeJuridique: raw.formejuridique ?? raw.FormeJuridique,
      AdresseGeo: raw.adressegeo ?? raw.AdresseGeo,
      AdressePost: raw.adressepost ?? raw.AdressePost,
      Ville: raw.ville ?? raw.Ville,
      Pays: raw.pays ?? raw.Pays,
      Telephone1: raw.telephone1 ?? raw.Telephone1,
      Telephone2: raw.telephone2 ?? raw.Telephone2,
      Email: raw.email ?? raw.Email,
      SiteWeb: raw.siteweb ?? raw.SiteWeb,
      DomaineActivite: raw.domaineactivite ?? raw.DomaineActivite,
      DisposeIFU: raw.disposeifu ?? raw.DisposeIFU,
      numIFU: raw.numifu ?? raw.numIFU,
      DisposeRCCM: raw.disposerccm ?? raw.DisposeRCCM,
      numRCCM: raw.numrccm ?? raw.numRCCM,
      NomPrenomRepr: raw.nomprenomrepr ?? raw.NomPrenomRepr,
      FonctionRepr: raw.fonctionrepr ?? raw.FonctionRepr,
      Telephone1Repr: raw.telephone1repr ?? raw.Telephone1Repr,
      EmailRepr: raw.emailrepr ?? raw.EmailRepr,
      Statut: raw.statut ?? raw.Statut,
    };
  }

  private normalizeSoumission(raw: any): any {
    if (!raw) return raw;
    return {
      idSoumission: raw.idsoumission ?? raw.idSoumission,
      numbLot: raw.numbLot ?? raw.numblot ?? raw.numb_lot,
      idFournisseur: raw.idfournisseur ?? raw.idFournisseur,
      DateDepot: raw.datedepot ?? raw.DateDepot,
      Heure: raw.heure ?? raw.Heure,
      Observation: raw.observation ?? raw.Observation,
      DelaiExecutionPrev: raw.delaiexecutionprev ?? raw.DelaiExecutionPrev,
      MontantPrev: raw.montantprev ?? raw.MontantPrev,
      nbExemplaire: raw.nbexemplaire ?? raw.nbExemplaire,
    };
  }

  private normalizeLot(raw: any): any {
    if (!raw) return raw;
    return {
      numbLot: raw.numbLot ?? raw.numblot ?? raw.numb_lot,
      numbMarche: raw.numbMarche ?? raw.numbmarche ?? raw.numb_marche,
      Description: raw.Description ?? raw.description,
      numbContrat: raw.numbContrat ?? raw.numbcontrat ?? raw.numb_contrat,
    };
  }

  private normalizeDocument(raw: any): any {
    if (!raw) return raw;
    return {
      numbLot: raw.numbLot ?? raw.numblot ?? raw.numb_lot,
      PV_ouverture: raw.pv_ouverture ?? raw.PV_ouverture ?? raw.pv_ouverture,
      RapportAnalyse: raw.rapportanalyse ?? raw.RapportAnalyse ?? raw.rapport_analyse,
      PV_attribution: raw.pv_attribution ?? raw.PV_attribution ?? raw.pv_attribution,
      Notification: raw.notification ?? raw.Notification,
      Contrat: raw.contrat ?? raw.Contrat,
      FED: raw.fed ?? raw.FED,
      BonCommande: raw.boncommande ?? raw.BonCommande ?? raw.bon_commande,
      Avenant: raw.avenant ?? raw.Avenant,
      OrdreService: raw.ordreservice ?? raw.OrdreService ?? raw.ordre_service,
      PV_reception_tech: raw.pv_reception_tech ?? raw.PV_reception_tech ?? raw.pv_reception_tech,
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
