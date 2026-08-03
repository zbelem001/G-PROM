import { Module } from '@nestjs/common';
import { PpmController } from './ppm.controller';
import { PpmService } from './ppm.service';
import { PpmTransferService } from './ppm-transfer.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [SupabaseModule, AuditModule],
  controllers: [PpmController],
  providers: [PpmService, PpmTransferService],
})
export class PpmModule {}
