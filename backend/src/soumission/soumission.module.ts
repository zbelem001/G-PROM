import { Module } from '@nestjs/common';
import { SoumissionController } from './soumission.controller';
import { SoumissionService } from './soumission.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [SupabaseModule, AuditModule],
  controllers: [SoumissionController],
  providers: [SoumissionService],
})
export class SoumissionModule {}
