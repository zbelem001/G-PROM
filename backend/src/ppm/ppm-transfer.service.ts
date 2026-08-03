import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../supabase/supabase.service';
import { AuditService } from '../audit/audit.service';

const SYSTEM_ACTOR = 'Système (PPM)';

// Bridges the annual procurement plan (PPM) to real Marché records: once a PPM
// line's planned launch date is reached, it's promoted to a "À lancer" Marché
// (pre-filled with the little info PPM has) for an agent to enrich further.
@Injectable()
export class PpmTransferService {
  private readonly logger = new Logger(PpmTransferService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async transferDueEntries(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const { data: duePpmEntries, error } = await this.supabaseService.client
      .from('PPM')
      .select('*')
      .eq('statut', 'Planifié')
      .lte('dateprevuelancement', today);
    if (error) {
      this.logger.error(`Lookup failed: ${error.message}`);
      return;
    }
    if (!duePpmEntries?.length) return;

    let transferred = 0;
    for (const ppm of duePpmEntries) {
      const marchePayload = this.auditService.stampCreate(
        {
          numbmarche: ppm.numbmarche,
          description: ppm.description,
          modepassation: ppm.modepassation,
          budgetestimatif: ppm.budgetestimatif,
          devise: ppm.devise ?? 'XOF',
          nombrelot: 1,
          statut: 'À lancer',
        },
        SYSTEM_ACTOR,
      );

      const { error: insertError } = await this.supabaseService.client.from('Marche').insert([marchePayload]);
      if (insertError) {
        this.logger.error(`Failed to create Marche ${ppm.numbmarche} from PPM: ${insertError.message}`);
        continue;
      }
      await this.auditService.log('Marche', ppm.numbmarche, 'CREATE', SYSTEM_ACTOR, null, marchePayload);

      const { error: updateError } = await this.supabaseService.client
        .from('PPM')
        .update({ statut: 'Transféré', userlastupdated: SYSTEM_ACTOR, datelastupdated: new Date().toISOString() })
        .eq('numbmarche', ppm.numbmarche);
      if (updateError) {
        this.logger.error(`Marche ${ppm.numbmarche} created, but failed to mark PPM entry as transféré: ${updateError.message}`);
        continue;
      }

      transferred += 1;
    }

    if (transferred > 0) {
      this.logger.log(`${transferred} marché(s) généré(s) automatiquement depuis le PPM.`);
    }
  }
}
