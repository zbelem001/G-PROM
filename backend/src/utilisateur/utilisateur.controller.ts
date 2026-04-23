import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UtilisateurService } from './utilisateur.service';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';

@Controller('utilisateurs')
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
