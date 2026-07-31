import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';

@Injectable()
export class FournisseurService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
  ) {}

  private normalizeKeys(dto: object): Record<string, unknown> {
    return Object.entries(dto).reduce((normalized, [key, value]) => {
      const lowerKey = key.replace(/([A-Z])/g, (match) => match.toLowerCase());
      normalized[lowerKey] = value;
      return normalized;
    }, {} as Record<string, unknown>);
  }

  async create(createFournisseurDto: CreateFournisseurDto, userEmail?: string) {
    const payload = this.auditService.stampCreate(this.normalizeKeys(createFournisseurDto), userEmail);
    const { data, error } = await this.supabaseService.client
      .from('Fournisseur')
      .insert([payload])
      .select()
      .single();
    if (error) {
      throw new Error(error.message);
    }
    await this.auditService.log('Fournisseur', data?.idfournisseur ?? '', 'CREATE', userEmail, null, data);
    return this.normalizeFournisseur(data);
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Fournisseur').select('*');
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []).map((row: any) => this.normalizeFournisseur(row));
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
    // Soumission table: lowercase columns (idfournisseur, numblot, idsoumission, montantprev)
    // Lot table: lowercase columns (numblot, numbmarche, description)
    // Attributaire table: PascalCase columns (idSoumissionAttribuee)
    // Document table: PascalCase columns (numbLot, RapportAnalyse)
    const [fournisseur, { data: soumissionsRaw, error: soumissionsError }] = await Promise.all([
      this.findOne(idFournisseur),
      this.supabaseService.client.from('Soumission').select('*').eq('idfournisseur', idFournisseur),
    ]);
    if (soumissionsError) throw new Error(soumissionsError.message);

    const rawLotKeys = (soumissionsRaw ?? []).map((s: any) => s.numblot).filter(Boolean);
    const soumissionIds = (soumissionsRaw ?? []).map((s: any) => String(s.idsoumission ?? '')).filter(Boolean);

    const [lotQuery, documentQuery, attributaireQuery] = await Promise.all([
      rawLotKeys.length
        ? this.supabaseService.client.from('Lot').select('*').in('numblot', rawLotKeys)
        : Promise.resolve({ data: [], error: null }),
      rawLotKeys.length
        ? this.supabaseService.client.from('Document').select('*').in('numblot', rawLotKeys)
        : Promise.resolve({ data: [], error: null }),
      soumissionIds.length
        ? this.supabaseService.client.from('Attributaire').select('*').in('idsoumissionattribuee', soumissionIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const lotByNumblot = new Map<string, any>(
      (lotQuery.data ?? []).map((l: any) => [String(l.numblot), l])
    );
    const adjugeeIds = new Set(
      (attributaireQuery.data ?? []).map((a: any) => String(a.idsoumissionattribuee ?? a.idSoumissionAttribuee ?? ''))
    );

    const soumissions = (soumissionsRaw ?? []).map((s: any) => {
      const lot = lotByNumblot.get(String(s.numblot ?? ''));
      return {
        idSoumission: s.idsoumission,
        numbLot: s.numblot,
        idFournisseur: s.idfournisseur,
        DateDepot: s.datedepot,
        Heure: s.heure,
        MontantPrev: s.montantprev ?? 0,
        lotDescription: lot?.description,
        numbMarche: lot?.numbmarche,
        estAdjugee: adjugeeIds.has(String(s.idsoumission ?? '')),
      };
    });

    const documents = (documentQuery.data ?? []).map((doc: any) => this.normalizeDocument(doc));
    return { fournisseur, soumissions, documents };
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

  async update(idFournisseur: number, updateFournisseurDto: Partial<CreateFournisseurDto>, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Fournisseur').select('*').eq('idfournisseur', idFournisseur).maybeSingle();
    const payload = this.auditService.stampUpdate(this.normalizeKeys(updateFournisseurDto), userEmail);
    const { data, error } = await this.supabaseService.client
      .from('Fournisseur')
      .update(payload)
      .eq('idfournisseur', idFournisseur)
      .select()
      .single();
    if (error) {
      throw new Error(error.message);
    }
    await this.auditService.log('Fournisseur', idFournisseur, 'UPDATE', userEmail, existing.data, data);
    return this.normalizeFournisseur(data);
  }

  async remove(idFournisseur: number, userEmail?: string) {
    const existing = await this.supabaseService.client.from('Fournisseur').select('*').eq('idfournisseur', idFournisseur).maybeSingle();
    const { data, error } = await this.supabaseService.client
      .from('Fournisseur')
      .delete()
      .eq('idfournisseur', idFournisseur);
    if (error) {
      throw new Error(error.message);
    }
    await this.auditService.log('Fournisseur', idFournisseur, 'DELETE', userEmail, existing.data, null);
    return data;
  }
}
