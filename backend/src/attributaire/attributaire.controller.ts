import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AttributaireService } from './attributaire.service';
import { CreateAttributaireDto } from './dto/create-attributaire.dto';

@UseGuards(JwtAuthGuard)
@Controller('attributaires')
export class AttributaireController {
  constructor(private readonly attributaireService: AttributaireService) {}

  @Post()
  create(@Body() createAttributaireDto: CreateAttributaireDto) {
    return this.attributaireService.create(createAttributaireDto);
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
  update(@Param('idSoumissionAttribuee') idSoumissionAttribuee: string, @Body() updateAttributaireDto: Partial<CreateAttributaireDto>) {
    return this.attributaireService.update(idSoumissionAttribuee, updateAttributaireDto);
  }

  @Delete(':idSoumissionAttribuee')
  remove(@Param('idSoumissionAttribuee') idSoumissionAttribuee: string) {
    return this.attributaireService.remove(idSoumissionAttribuee);
  }
}
