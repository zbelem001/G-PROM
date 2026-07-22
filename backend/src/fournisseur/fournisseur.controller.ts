import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FournisseurService } from './fournisseur.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';

@UseGuards(JwtAuthGuard)
@Controller('fournisseurs')
export class FournisseurController {
  constructor(private readonly fournisseurService: FournisseurService) {}

  @Post()
  create(@Body() createFournisseurDto: CreateFournisseurDto) {
    return this.fournisseurService.create(createFournisseurDto);
  }

  @Get()
  findAll() {
    return this.fournisseurService.findAll();
  }

  @Get('details/:idFournisseur')
  findDetails(@Param('idFournisseur') idFournisseur: string) {
    return this.fournisseurService.findDetails(Number(idFournisseur));
  }

  @Get(':idFournisseur')
  findOne(@Param('idFournisseur') idFournisseur: string) {
    return this.fournisseurService.findOne(Number(idFournisseur));
  }

  @Patch(':idFournisseur')
  update(@Param('idFournisseur') idFournisseur: string, @Body() updateFournisseurDto: Partial<CreateFournisseurDto>) {
    return this.fournisseurService.update(Number(idFournisseur), updateFournisseurDto);
  }

  @Delete(':idFournisseur')
  remove(@Param('idFournisseur') idFournisseur: string) {
    return this.fournisseurService.remove(Number(idFournisseur));
  }
}
