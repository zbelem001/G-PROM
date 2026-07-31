import { Module } from '@nestjs/common';
import { OptionMarcheController } from './option-marche.controller';
import { OptionMarcheService } from './option-marche.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [SupabaseModule, AuditModule],
  controllers: [OptionMarcheController],
  providers: [OptionMarcheService],
})
export class OptionMarcheModule {}
