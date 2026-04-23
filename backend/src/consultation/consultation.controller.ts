import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Controller('consultations')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Post()
  create(@Body() createConsultationDto: CreateConsultationDto) {
    return this.consultationService.create(createConsultationDto);
  }

  @Get()
  findAll() {
    return this.consultationService.findAll();
  }

  @Get(':numbLot/:idFournisseur')
  findOne(@Param('numbLot') numbLot: string, @Param('idFournisseur') idFournisseur: string) {
    return this.consultationService.findOne(numbLot, Number(idFournisseur));
  }

  @Patch(':numbLot/:idFournisseur')
  update(
    @Param('numbLot') numbLot: string,
    @Param('idFournisseur') idFournisseur: string,
    @Body() updateConsultationDto: Partial<CreateConsultationDto>,
  ) {
    return this.consultationService.update(numbLot, Number(idFournisseur), updateConsultationDto);
  }

  @Delete(':numbLot/:idFournisseur')
  remove(@Param('numbLot') numbLot: string, @Param('idFournisseur') idFournisseur: string) {
    return this.consultationService.remove(numbLot, Number(idFournisseur));
  }
}
