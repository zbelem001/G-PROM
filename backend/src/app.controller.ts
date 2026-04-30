import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AppService } from './app.service';
import type {
  Attributaire,
  Avenant,
  Consultation,
  Document,
  Fournisseur,
  Lot,
  Marche,
  Soumission,
  Utilisateur,
  Analyse,
} from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Marches
  // Les routes des marchés sont gérées par MarcheController pour utiliser Supabase.

  // Lots routes are handled by LotModule/LotController using Supabase.

  // Fournisseurs
  @Get('fournisseurs')
  async getFournisseurs(): Promise<Fournisseur[]> {
    return this.appService.getFournisseurs();
  }

  @Get('fournisseurs/:idFournisseur')
  async getFournisseur(@Param('idFournisseur') idFournisseur: string): Promise<Fournisseur> {
    return this.appService.getFournisseur(Number(idFournisseur));
  }

  @Post('fournisseurs')
  async createFournisseur(@Body() fournisseur: Partial<Fournisseur>): Promise<Fournisseur> {
    return this.appService.createFournisseur(fournisseur);
  }

  @Put('fournisseurs/:idFournisseur')
  async updateFournisseur(@Param('idFournisseur') idFournisseur: string, @Body() changes: Partial<Fournisseur>): Promise<Fournisseur> {
    return this.appService.updateFournisseur(Number(idFournisseur), changes);
  }

  @Delete('fournisseurs/:idFournisseur')
  deleteFournisseur(@Param('idFournisseur') idFournisseur: string): void {
    return this.appService.deleteFournisseur(Number(idFournisseur));
  }

  // Utilisateurs
  @Get('utilisateurs')
  getUtilisateurs(): Utilisateur[] {
    return this.appService.getUtilisateurs();
  }

  @Get('utilisateurs/:idUtilisateur')
  getUtilisateur(@Param('idUtilisateur') idUtilisateur: string): Utilisateur {
    return this.appService.getUtilisateur(Number(idUtilisateur));
  }

  @Post('utilisateurs')
  createUtilisateur(@Body() utilisateur: Partial<Utilisateur>): Utilisateur {
    return this.appService.createUtilisateur(utilisateur);
  }

  @Put('utilisateurs/:idUtilisateur')
  updateUtilisateur(@Param('idUtilisateur') idUtilisateur: string, @Body() changes: Partial<Utilisateur>): Utilisateur {
    return this.appService.updateUtilisateur(Number(idUtilisateur), changes);
  }

  @Delete('utilisateurs/:idUtilisateur')
  deleteUtilisateur(@Param('idUtilisateur') idUtilisateur: string): void {
    return this.appService.deleteUtilisateur(Number(idUtilisateur));
  }

  // Consultations
  @Get('consultations')
  getConsultations(): Consultation[] {
    return this.appService.getConsultations();
  }

  @Get('consultations/:numbLot/:idFournisseur')
  getConsultation(@Param('numbLot') numbLot: string, @Param('idFournisseur') idFournisseur: string): Consultation {
    return this.appService.getConsultation(numbLot, Number(idFournisseur));
  }

  @Post('consultations')
  createConsultation(@Body() consultation: Partial<Consultation>): Consultation {
    return this.appService.createConsultation(consultation);
  }

  @Put('consultations/:numbLot/:idFournisseur')
  updateConsultation(@Param('numbLot') numbLot: string, @Param('idFournisseur') idFournisseur: string, @Body() changes: Partial<Consultation>): Consultation {
    return this.appService.updateConsultation(numbLot, Number(idFournisseur), changes);
  }

  @Delete('consultations/:numbLot/:idFournisseur')
  deleteConsultation(@Param('numbLot') numbLot: string, @Param('idFournisseur') idFournisseur: string): void {
    return this.appService.deleteConsultation(numbLot, Number(idFournisseur));
  }

  // Soumissions
  @Get('soumissions')
  getSoumissions(): Soumission[] {
    return this.appService.getSoumissions();
  }

  @Get('soumissions/:idSoumission')
  getSoumission(@Param('idSoumission') idSoumission: string): Soumission {
    return this.appService.getSoumission(idSoumission);
  }

  @Post('soumissions')
  createSoumission(@Body() soumission: Partial<Soumission>): Soumission {
    return this.appService.createSoumission(soumission);
  }

  @Put('soumissions/:idSoumission')
  updateSoumission(@Param('idSoumission') idSoumission: string, @Body() changes: Partial<Soumission>): Soumission {
    return this.appService.updateSoumission(idSoumission, changes);
  }

  @Delete('soumissions/:idSoumission')
  deleteSoumission(@Param('idSoumission') idSoumission: string): void {
    return this.appService.deleteSoumission(idSoumission);
  }

  // Analyses
  @Get('analyses')
  getAnalyses(): Analyse[] {
    return this.appService.getAnalyses();
  }

  @Get('analyses/:numbLot')
  getAnalyse(@Param('numbLot') numbLot: string): Analyse {
    return this.appService.getAnalyse(numbLot);
  }

  @Post('analyses')
  createAnalyse(@Body() analyse: Partial<Analyse>): Analyse {
    return this.appService.createAnalyse(analyse);
  }

  @Put('analyses/:numbLot')
  updateAnalyse(@Param('numbLot') numbLot: string, @Body() changes: Partial<Analyse>): Analyse {
    return this.appService.updateAnalyse(numbLot, changes);
  }

  @Delete('analyses/:numbLot')
  deleteAnalyse(@Param('numbLot') numbLot: string): void {
    return this.appService.deleteAnalyse(numbLot);
  }

  // Attributaires
  @Get('attributaires')
  getAttributaires(): Attributaire[] {
    return this.appService.getAttributaires();
  }

  @Get('attributaires/:idSoumissionAttribuee')
  getAttributaire(@Param('idSoumissionAttribuee') idSoumissionAttribuee: string): Attributaire {
    return this.appService.getAttributaire(idSoumissionAttribuee);
  }

  @Post('attributaires')
  createAttributaire(@Body() attributaire: Partial<Attributaire>): Attributaire {
    return this.appService.createAttributaire(attributaire);
  }

  @Put('attributaires/:idSoumissionAttribuee')
  updateAttributaire(@Param('idSoumissionAttribuee') idSoumissionAttribuee: string, @Body() changes: Partial<Attributaire>): Attributaire {
    return this.appService.updateAttributaire(idSoumissionAttribuee, changes);
  }

  @Delete('attributaires/:idSoumissionAttribuee')
  deleteAttributaire(@Param('idSoumissionAttribuee') idSoumissionAttribuee: string): void {
    return this.appService.deleteAttributaire(idSoumissionAttribuee);
  }

  // Avenants
  @Get('avenants')
  getAvenants(): Avenant[] {
    return this.appService.getAvenants();
  }

  @Get('avenants/:idAvenant')
  getAvenant(@Param('idAvenant') idAvenant: string): Avenant {
    return this.appService.getAvenant(Number(idAvenant));
  }

  @Post('avenants')
  createAvenant(@Body() avenant: Partial<Avenant>): Avenant {
    return this.appService.createAvenant(avenant);
  }

  @Put('avenants/:idAvenant')
  updateAvenant(@Param('idAvenant') idAvenant: string, @Body() changes: Partial<Avenant>): Avenant {
    return this.appService.updateAvenant(Number(idAvenant), changes);
  }

  @Delete('avenants/:idAvenant')
  deleteAvenant(@Param('idAvenant') idAvenant: string): void {
    return this.appService.deleteAvenant(Number(idAvenant));
  }

  // Documents
  @Get('documents')
  getDocuments(): Document[] {
    return this.appService.getDocuments();
  }

  @Get('documents/:numbLot')
  getDocument(@Param('numbLot') numbLot: string): Document {
    return this.appService.getDocument(numbLot);
  }

  @Post('documents')
  createDocument(@Body() document: Partial<Document>): Document {
    return this.appService.createDocument(document);
  }

  @Put('documents/:numbLot')
  updateDocument(@Param('numbLot') numbLot: string, @Body() changes: Partial<Document>): Document {
    return this.appService.updateDocument(numbLot, changes);
  }

  @Delete('documents/:numbLot')
  deleteDocument(@Param('numbLot') numbLot: string): void {
    return this.appService.deleteDocument(numbLot);
  }
}
