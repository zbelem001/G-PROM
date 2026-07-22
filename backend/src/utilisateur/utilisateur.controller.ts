import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UtilisateurService } from './utilisateur.service';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('utilisateurs')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UtilisateurController {
  constructor(private readonly utilisateurService: UtilisateurService) {}

  @Post()
  create(@Body() createUtilisateurDto: CreateUtilisateurDto) {
    return this.utilisateurService.create(createUtilisateurDto);
  }

  @Get()
  findAll() {
    return this.utilisateurService.findAll();
  }

  @Get(':idUtilisateur')
  findOne(@Param('idUtilisateur') idUtilisateur: string) {
    return this.utilisateurService.findOne(Number(idUtilisateur));
  }

  @Patch(':idUtilisateur')
  update(@Param('idUtilisateur') idUtilisateur: string, @Body() updateUtilisateurDto: Partial<CreateUtilisateurDto>) {
    return this.utilisateurService.update(Number(idUtilisateur), updateUtilisateurDto);
  }

  @Delete(':idUtilisateur')
  remove(@Param('idUtilisateur') idUtilisateur: string) {
    return this.utilisateurService.remove(Number(idUtilisateur));
  }
}
