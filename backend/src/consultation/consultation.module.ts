import { Module } from '@nestjs/common';
import { ConsultationController } from './consultation.controller';
import { ConsultationService } from './consultation.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuditModule } from '../audit/audit.module';
import { MarcheStatusModule } from '../marche-status/marche-status.module';

@Module({
  imports: [SupabaseModule, AuditModule, MarcheStatusModule],
  controllers: [ConsultationController],
  providers: [ConsultationService],
})
export class ConsultationModule {}
