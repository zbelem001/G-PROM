import { Module } from '@nestjs/common';
import { AttributaireController } from './attributaire.controller';
import { AttributaireService } from './attributaire.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [AttributaireController],
  providers: [AttributaireService],
})
export class AttributaireModule {}
