import { Module } from '@nestjs/common';
import { AnalyseController } from './analyse.controller';
import { AnalyseService } from './analyse.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuditModule } from '../audit/audit.module';
import { MarcheStatusModule } from '../marche-status/marche-status.module';

@Module({
  imports: [SupabaseModule, AuditModule, MarcheStatusModule],
  controllers: [AnalyseController],
  providers: [AnalyseService],
})
export class AnalyseModule {}
