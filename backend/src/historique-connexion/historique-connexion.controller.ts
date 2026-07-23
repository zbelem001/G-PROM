import { Controller, Get, UseGuards } from '@nestjs/common';
import { HistoriqueConnexionService } from './historique-connexion.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('historique-connexions')
export class HistoriqueConnexionController {
  constructor(private readonly historiqueConnexionService: HistoriqueConnexionService) {}

  @Get()
  findAll() {
    return this.historiqueConnexionService.findAll();
  }
}
