import { Module } from '@nestjs/common';
import { AttributaireController } from './attributaire.controller';
import { AttributaireService } from './attributaire.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuditModule } from '../audit/audit.module';
import { MarcheStatusModule } from '../marche-status/marche-status.module';

@Module({
  imports: [SupabaseModule, AuditModule, MarcheStatusModule],
  controllers: [AttributaireController],
  providers: [AttributaireService],
})
export class AttributaireModule {}
