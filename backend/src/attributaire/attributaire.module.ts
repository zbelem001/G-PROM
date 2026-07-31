import { Module } from '@nestjs/common';
import { AttributaireController } from './attributaire.controller';
import { AttributaireService } from './attributaire.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [SupabaseModule, AuditModule],
  controllers: [AttributaireController],
  providers: [AttributaireService],
})
export class AttributaireModule {}
