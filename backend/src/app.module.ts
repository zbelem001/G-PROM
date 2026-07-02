import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MarcheModule } from './marche/marche.module';
import { LotModule } from './lot/lot.module';
import { FournisseurModule } from './fournisseur/fournisseur.module';
import { ConsultationModule } from './consultation/consultation.module';
import { SoumissionModule } from './soumission/soumission.module';
import { AnalyseModule } from './analyse/analyse.module';
import { AttributaireModule } from './attributaire/attributaire.module';
import { AvenantModule } from './avenant/avenant.module';
import { DocumentModule } from './document/document.module';
import { UtilisateurModule } from './utilisateur/utilisateur.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'test/.env'],
    }),
    MarcheModule,
    LotModule,
    FournisseurModule,
    ConsultationModule,
    SoumissionModule,
    AnalyseModule,
    AttributaireModule,
    AvenantModule,
    DocumentModule,
    UtilisateurModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
