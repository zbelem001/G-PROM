import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

// A document is considered "not uploaded" both when the column is empty AND when it
// holds the literal placeholder string "Non" — the convention used across this schema
// (see Document/Marche rows) for "no file yet". A plain Boolean(value) would wrongly
// treat "Non" as truthy, so uploaded status must be checked explicitly.
function isDocumentUploaded(value: unknown): boolean {
  return typeof value === 'string' && value.trim() !== '' && value.trim().toLowerCase() !== 'non';
}

const DOCUMENT_FIELDS: Record<string, string> = {
  pv_ouverture: 'pv_ouverture',
  rapport_analyse: 'rapportanalyse',
  pv_attribution: 'pv_attribution',
  notification: 'notification',
  contrat: 'contrat',
  fed: 'fed',
  bon_commande: 'boncommande',
  avenant: 'avenant',
  ordre_service: 'ordreservice',
  pv_reception_tech: 'pv_reception_tech',
  pv_reception_prov: 'pv_reception_prov',
  pv_reception_def: 'pv_reception_def',
};

// All tools here are strictly read-only (SELECT only) — the chat assistant
// must never be able to create/update/delete data through a tool call.
@Injectable()
export class ChatToolsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  get toolDefinitions() {
    return [
      {
        type: 'function' as const,
        function: {
          name: 'get_dashboard_stats',
          description:
            "Retourne des statistiques globales sur G-PROM : nombre de marchés par statut, budget total par devise, nombre de fournisseurs, nombre de marchés archivés.",
          parameters: { type: 'object', properties: {}, additionalProperties: false },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'search_marches',
          description:
            "Recherche des marchés par mot-clé (objet/description), statut ou demandeur. Retourne le nombre total de correspondances (champ nombreCorrespondant, à citer tel quel) et une liste courte (max 15, champ resultats).",
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: "Mot-clé à chercher dans le numéro ou la description du marché." },
              statut: { type: 'string', description: "Filtrer par statut exact du marché (ex: 'À lancer')." },
              demandeur: { type: 'string', description: 'Filtrer par département/direction demandeur.' },
            },
            additionalProperties: false,
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'get_marche_details',
          description:
            "Retourne l'état complet d'un marché précis à partir de son numéro : infos générales, budget, statut, financement, et la liste de ses lots avec, pour chaque lot, quels documents sont chargés.",
          parameters: {
            type: 'object',
            properties: {
              numbMarche: { type: 'string', description: 'Le numéro exact du marché, ex: MAR-2026-002.' },
            },
            required: ['numbMarche'],
            additionalProperties: false,
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'check_document',
          description:
            "Vérifie si un document spécifique a été chargé pour un lot donné (ex: PV d'ouverture, rapport d'analyse, contrat...).",
          parameters: {
            type: 'object',
            properties: {
              numbLot: { type: 'string', description: 'Le numéro du lot, ex: L-A1B2.' },
              documentType: {
                type: 'string',
                enum: Object.keys(DOCUMENT_FIELDS),
                description: 'Le type de document à vérifier.',
              },
            },
            required: ['numbLot', 'documentType'],
            additionalProperties: false,
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'search_fournisseurs',
          description:
            'Recherche des fournisseurs par nom (raison sociale). Retourne le nombre total de correspondances (champ nombreCorrespondant, à citer tel quel) et une liste courte (max 15, champ resultats).',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Mot-clé à chercher dans la raison sociale.' },
            },
            additionalProperties: false,
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'get_fournisseur_details',
          description:
            "Retourne les informations détaillées d'un fournisseur (contact, statut) et un résumé de ses soumissions/attributions.",
          parameters: {
            type: 'object',
            properties: {
              idFournisseur: { type: 'number', description: "L'identifiant numérique du fournisseur." },
            },
            required: ['idFournisseur'],
            additionalProperties: false,
          },
        },
      },
    ];
  }

  async execute(name: string, args: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'get_dashboard_stats':
        return this.getDashboardStats();
      case 'search_marches':
        return this.searchMarches(args as any);
      case 'get_marche_details':
        return this.getMarcheDetails(String(args['numbMarche'] ?? ''));
      case 'check_document':
        return this.checkDocument(String(args['numbLot'] ?? ''), String(args['documentType'] ?? ''));
      case 'search_fournisseurs':
        return this.searchFournisseurs(String(args['query'] ?? ''));
      case 'get_fournisseur_details':
        return this.getFournisseurDetails(Number(args['idFournisseur']));
      default:
        return { error: `Outil inconnu: ${name}` };
    }
  }

  private async getDashboardStats() {
    const { data: marches, error: marchesError } = await this.supabaseService.client
      .from('Marche')
      .select('statut, budgetestimatif, devise, estarchive');
    if (marchesError) return { error: marchesError.message };

    const parStatut: Record<string, number> = {};
    const budgetParDevise: Record<string, number> = {};
    let archives = 0;
    for (const m of marches ?? []) {
      const statut = m.statut || 'Non défini';
      parStatut[statut] = (parStatut[statut] ?? 0) + 1;
      if (m.budgetestimatif) {
        const devise = m.devise || 'XOF';
        budgetParDevise[devise] = (budgetParDevise[devise] ?? 0) + Number(m.budgetestimatif);
      }
      if (m.estarchive) archives += 1;
    }

    const { count: nbFournisseurs } = await this.supabaseService.client
      .from('Fournisseur')
      .select('*', { count: 'exact', head: true });

    return {
      totalMarches: marches?.length ?? 0,
      marchesParStatut: parStatut,
      budgetTotalParDevise: budgetParDevise,
      marchesArchives: archives,
      nombreFournisseurs: nbFournisseurs ?? 0,
    };
  }

  private async searchMarches(args: { query?: string; statut?: string; demandeur?: string }) {
    let q = this.supabaseService.client
      .from('Marche')
      .select('numbmarche, description, statut, budgetestimatif, devise, demandeur', { count: 'exact' })
      .limit(15);
    if (args.query) {
      q = q.or(`numbmarche.ilike.%${args.query}%,description.ilike.%${args.query}%`);
    }
    if (args.statut) {
      q = q.ilike('statut', `%${args.statut}%`);
    }
    if (args.demandeur) {
      q = q.ilike('demandeur', `%${args.demandeur}%`);
    }
    const { data, error, count } = await q;
    if (error) return { error: error.message };
    // nombreCorrespondant is the exact match count — use it, never count the (truncated) resultats array yourself.
    return { nombreCorrespondant: count ?? (data ?? []).length, resultats: data ?? [] };
  }

  private async getMarcheDetails(numbMarche: string) {
    if (!numbMarche) return { error: 'numbMarche requis.' };
    const { data: marche, error: marcheError } = await this.supabaseService.client
      .from('Marche')
      .select('*')
      .eq('numbmarche', numbMarche)
      .maybeSingle();
    if (marcheError) return { error: marcheError.message };
    if (!marche) return { error: `Aucun marché trouvé avec le numéro ${numbMarche}.` };

    const { data: lots } = await this.supabaseService.client
      .from('Lot')
      .select('numblot, nomlot, description')
      .eq('numbmarche', numbMarche);

    const lotIds = (lots ?? []).map((l: any) => l.numblot);
    const { data: documents } = lotIds.length
      ? await this.supabaseService.client.from('Document').select('*').in('numblot', lotIds)
      : { data: [] as any[] };

    const docByLot = new Map<string, any>((documents ?? []).map((d: any) => [d.numblot, d]));

    return {
      marche: {
        numbMarche: marche.numbmarche,
        description: marche.description,
        statut: marche.statut,
        budgetEstimatif: marche.budgetestimatif,
        devise: marche.devise,
        demandeur: marche.demandeur,
        natureOuverture: marche.natureouverture,
        responsableSuivi: marche.responsablesuivi,
        financement: marche.financement,
        dateEnregistrement: marche.dateenregistrement,
        datePrevReception: marche.dateprevreception,
        estArchive: marche.estarchive,
      },
      lots: (lots ?? []).map((l: any) => {
        const doc = docByLot.get(l.numblot);
        return {
          numbLot: l.numblot,
          nomLot: l.nomlot,
          description: l.description,
          documentsCharges: doc
            ? Object.fromEntries(Object.entries(DOCUMENT_FIELDS).map(([label, col]) => [label, isDocumentUploaded(doc[col])]))
            : Object.fromEntries(Object.keys(DOCUMENT_FIELDS).map((label) => [label, false])),
        };
      }),
    };
  }

  private async checkDocument(numbLot: string, documentType: string) {
    if (!numbLot || !documentType) return { error: 'numbLot et documentType requis.' };
    const column = DOCUMENT_FIELDS[documentType];
    if (!column) return { error: `Type de document inconnu: ${documentType}` };

    const { data, error } = await this.supabaseService.client
      .from('Document')
      .select('*')
      .eq('numblot', numbLot)
      .maybeSingle();
    if (error) return { error: error.message };
    if (!data) return { numbLot, documentType, charge: false, raison: 'Aucun document enregistré pour ce lot.' };

    return { numbLot, documentType, charge: isDocumentUploaded(data[column]) };
  }

  private async searchFournisseurs(query: string) {
    let q = this.supabaseService.client
      .from('Fournisseur')
      .select('idfournisseur, raisonsocial, ville, pays, statut', { count: 'exact' })
      .limit(15);
    if (query) {
      q = q.ilike('raisonsocial', `%${query}%`);
    }
    const { data, error, count } = await q;
    if (error) return { error: error.message };
    // nombreCorrespondant is the exact match count — use it, never count the (truncated) resultats array yourself.
    return { nombreCorrespondant: count ?? (data ?? []).length, resultats: data ?? [] };
  }

  private async getFournisseurDetails(idFournisseur: number) {
    if (!idFournisseur || Number.isNaN(idFournisseur)) return { error: 'idFournisseur requis.' };
    const { data: fournisseur, error } = await this.supabaseService.client
      .from('Fournisseur')
      .select('*')
      .eq('idfournisseur', idFournisseur)
      .maybeSingle();
    if (error) return { error: error.message };
    if (!fournisseur) return { error: `Aucun fournisseur trouvé avec l'identifiant ${idFournisseur}.` };

    const { data: soumissions } = await this.supabaseService.client
      .from('Soumission')
      .select('idsoumission, numblot, montantprev')
      .eq('idfournisseur', idFournisseur);

    return {
      fournisseur: {
        idFournisseur: fournisseur.idfournisseur,
        raisonSocial: fournisseur.raisonsocial,
        ville: fournisseur.ville,
        pays: fournisseur.pays,
        email: fournisseur.email,
        statut: fournisseur.statut,
      },
      nombreSoumissions: soumissions?.length ?? 0,
    };
  }
}
