import { Module } from '@nestjs/common';
import { BailleurController } from './bailleur.controller';
import { BailleurService } from './bailleur.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [SupabaseModule, AuditModule],
  controllers: [BailleurController],
  providers: [BailleurService],
})
export class BailleurModule {}
