import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../supabase/supabase.service';

const ARCHIVE_AFTER_MONTHS = 3;

// A "Clôturé" marché is archived automatically 3 months after closure (or sooner,
// manually, via the existing "Archiver" button on the Marchés page).
@Injectable()
export class MarcheArchiveService {
  private readonly logger = new Logger(MarcheArchiveService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async archiveOldClosedMarches(): Promise<void> {
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() - ARCHIVE_AFTER_MONTHS);

    const { data, error } = await this.supabaseService.client
      .from('Marche')
      .select('numbmarche')
      .eq('statut', 'Clôturé')
      .eq('estarchive', false)
      .not('datecloture', 'is', null)
      .lte('datecloture', threshold.toISOString());

    if (error) {
      this.logger.error(`Lookup failed: ${error.message}`);
      return;
    }
    if (!data?.length) return;

    const { error: updateError } = await this.supabaseService.client
      .from('Marche')
      .update({ estarchive: true, datearchivage: new Date().toISOString() })
      .in(
        'numbmarche',
        data.map((m) => m.numbmarche),
      );
    if (updateError) {
      this.logger.error(`Archive update failed: ${updateError.message}`);
      return;
    }

    this.logger.log(`${data.length} marché(s) clôturé(s) depuis plus de ${ARCHIVE_AFTER_MONTHS} mois archivé(s) automatiquement.`);
  }
}
