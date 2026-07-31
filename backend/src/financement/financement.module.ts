import { Module } from '@nestjs/common';
import { FinancementController } from './financement.controller';
import { FinancementService } from './financement.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [SupabaseModule, AuditModule],
  controllers: [FinancementController],
  providers: [FinancementService],
})
export class FinancementModule {}
