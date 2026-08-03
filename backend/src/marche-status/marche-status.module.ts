import { Module } from '@nestjs/common';
import { MarcheStatusService } from './marche-status.service';
import { MarcheArchiveService } from './marche-archive.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [MarcheStatusService, MarcheArchiveService],
  exports: [MarcheStatusService],
})
export class MarcheStatusModule {}
