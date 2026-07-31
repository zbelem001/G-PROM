import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt-auth.guard';
import { FournisseurService } from './fournisseur.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';

@UseGuards(JwtAuthGuard)
@Controller('fournisseurs')
export class FournisseurController {
  constructor(private readonly fournisseurService: FournisseurService) {}

  @Post()
  create(@Body() createFournisseurDto: CreateFournisseurDto, @CurrentUser() user?: AuthenticatedUser) {
    return this.fournisseurService.create(createFournisseurDto, user?.email);
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
  update(
    @Param('idFournisseur') idFournisseur: string,
    @Body() updateFournisseurDto: Partial<CreateFournisseurDto>,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.fournisseurService.update(Number(idFournisseur), updateFournisseurDto, user?.email);
  }

  @Delete(':idFournisseur')
  remove(@Param('idFournisseur') idFournisseur: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.fournisseurService.remove(Number(idFournisseur), user?.email);
  }
}
