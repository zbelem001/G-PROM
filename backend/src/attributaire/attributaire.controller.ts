import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt-auth.guard';
import { AttributaireService } from './attributaire.service';
import { CreateAttributaireDto } from './dto/create-attributaire.dto';

@UseGuards(JwtAuthGuard)
@Controller('attributaires')
export class AttributaireController {
  constructor(private readonly attributaireService: AttributaireService) {}

  @Post()
  create(@Body() createAttributaireDto: CreateAttributaireDto, @CurrentUser() user?: AuthenticatedUser) {
    return this.attributaireService.create(createAttributaireDto, user?.email);
  }

  @Get()
  findAll() {
    return this.attributaireService.findAll();
  }

  @Get(':idSoumissionAttribuee')
  findOne(@Param('idSoumissionAttribuee') idSoumissionAttribuee: string) {
    return this.attributaireService.findOne(idSoumissionAttribuee);
  }

  @Patch(':idSoumissionAttribuee')
  update(
    @Param('idSoumissionAttribuee') idSoumissionAttribuee: string,
    @Body() updateAttributaireDto: Partial<CreateAttributaireDto>,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.attributaireService.update(idSoumissionAttribuee, updateAttributaireDto, user?.email);
  }

  @Delete(':idSoumissionAttribuee')
  remove(@Param('idSoumissionAttribuee') idSoumissionAttribuee: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.attributaireService.remove(idSoumissionAttribuee, user?.email);
  }
}
