import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuditModule } from '../audit/audit.module';
import { MarcheStatusModule } from '../marche-status/marche-status.module';

@Module({
  imports: [SupabaseModule, AuditModule, MarcheStatusModule],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
