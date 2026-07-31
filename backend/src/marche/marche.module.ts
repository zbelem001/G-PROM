import { Module } from '@nestjs/common';
import { MarcheController } from './marche.controller';
import { MarcheService } from './marche.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [SupabaseModule, AuditModule],
  controllers: [MarcheController],
  providers: [MarcheService],
})
export class MarcheModule {}
