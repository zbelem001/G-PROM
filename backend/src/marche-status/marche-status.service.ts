import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export type MarcheStatut = 'À lancer' | 'Réception' | 'Analyse' | 'En cours' | 'Exécuté' | 'Clôturé';

// Forward-only lifecycle: a marché's statut only ever advances, it never regresses
// automatically. Legacy/unknown values are treated as rank 0 so they still advance.
const STATUS_RANK: Record<string, number> = {
  'À lancer': 0,
  'Réception': 1,
  'Analyse': 2,
  'En cours': 3,
  'Exécuté': 4,
  'Clôturé': 5,
};

// Drives Marche.statut off events elsewhere in the procurement workflow (consultation
// started, analysis started, attribution made/completed, réception définitive
// uploaded) instead of manual edits — see the 6-stage lifecycle the client specified:
// À lancer → Réception → Analyse → En cours → Exécuté → Clôturé.
@Injectable()
export class MarcheStatusService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // Gate for the "Réception" milestone: a marché generated from the PPM starts
  // with only the bare minimum (description, budget...) — an agent must first fill
  // in the demandeur and actually create the lots before consultations can begin.
  async assertReadyForReception(numbLot: string): Promise<void> {
    const { data: lot, error: lotError } = await this.supabaseService.client
      .from('Lot')
      .select('numbmarche')
      .eq('numblot', numbLot)
      .maybeSingle();
    if (lotError) {
      console.error('MarcheStatusService.assertReadyForReception — lot lookup failed:', lotError.message);
      return;
    }
    if (!lot?.numbmarche) return;

    const { data: marche, error: marcheError } = await this.supabaseService.client
      .from('Marche')
      .select('demandeur, nombrelot')
      .eq('numbmarche', lot.numbmarche)
      .maybeSingle();
    if (marcheError) {
      console.error('MarcheStatusService.assertReadyForReception — marché lookup failed:', marcheError.message);
      return;
    }
    if (!marche) return;

    if (!marche.demandeur) {
      throw new BadRequestException(
        `Le marché ${lot.numbmarche} doit avoir un demandeur renseigné avant de pouvoir consulter des fournisseurs.`,
      );
    }

    const { count: lotCount, error: countError } = await this.supabaseService.client
      .from('Lot')
      .select('*', { count: 'exact', head: true })
      .eq('numbmarche', lot.numbmarche);
    if (countError) {
      console.error('MarcheStatusService.assertReadyForReception — lot count failed:', countError.message);
      return;
    }

    if ((lotCount ?? 0) < (marche.nombrelot ?? 0)) {
      throw new BadRequestException(
        `Le marché ${lot.numbmarche} doit avoir ses ${marche.nombrelot} lot(s) créés (actuellement ${lotCount ?? 0}) avant de pouvoir consulter des fournisseurs.`,
      );
    }
  }

  async advanceForLot(numbLot: string, targetStatut: MarcheStatut): Promise<void> {
    if (!numbLot) return;
    const { data: lot, error } = await this.supabaseService.client
      .from('Lot')
      .select('numbmarche')
      .eq('numblot', numbLot)
      .maybeSingle();
    if (error) {
      console.error('MarcheStatusService.advanceForLot — lookup failed:', error.message);
      return;
    }
    if (!lot?.numbmarche) return;
    await this.advanceMarche(lot.numbmarche, targetStatut);
  }

  async advanceForSoumission(idSoumission: string, targetStatut: MarcheStatut): Promise<void> {
    if (!idSoumission) return;
    const { data: soumission, error } = await this.supabaseService.client
      .from('Soumission')
      .select('numblot')
      .eq('idsoumission', idSoumission)
      .maybeSingle();
    if (error) {
      console.error('MarcheStatusService.advanceForSoumission — lookup failed:', error.message);
      return;
    }
    if (!soumission?.numblot) return;
    await this.advanceForLot(soumission.numblot, targetStatut);
  }

  async advanceMarche(numbMarche: string, targetStatut: MarcheStatut): Promise<void> {
    const { data: marche, error } = await this.supabaseService.client
      .from('Marche')
      .select('statut')
      .eq('numbmarche', numbMarche)
      .maybeSingle();
    if (error) {
      console.error('MarcheStatusService.advanceMarche — lookup failed:', error.message);
      return;
    }
    if (!marche) return;

    const currentRank = STATUS_RANK[marche.statut] ?? 0;
    const targetRank = STATUS_RANK[targetStatut];
    if (targetRank <= currentRank) return;

    // datecloture anchors the 3-month auto-archival countdown (see MarcheArchiveService) —
    // it must only be set once, when the marché actually reaches "Clôturé", not touched
    // by unrelated later edits the way datelastupdated would be.
    const payload: Record<string, unknown> = { statut: targetStatut };
    if (targetStatut === 'Clôturé') {
      payload.datecloture = new Date().toISOString();
    }

    const { error: updateError } = await this.supabaseService.client
      .from('Marche')
      .update(payload)
      .eq('numbmarche', numbMarche);
    if (updateError) {
      console.error('MarcheStatusService.advanceMarche — update failed:', updateError.message);
    }
  }
}
