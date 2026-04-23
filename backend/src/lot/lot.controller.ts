import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { LotService } from './lot.service';
import { CreateLotDto } from './dto/create-lot.dto';

@Controller('lots')
export class LotController {
  constructor(private readonly lotService: LotService) {}

  @Post()
  create(@Body() createLotDto: CreateLotDto) {
    return this.lotService.create(createLotDto);
  }

  @Get()
  findAll() {
    return this.lotService.findAll();
  }

  @Get(':numbLot')
  findOne(@Param('numbLot') numbLot: string) {
    return this.lotService.findOne(numbLot);
  }

  @Patch(':numbLot')
  update(@Param('numbLot') numbLot: string, @Body() updateLotDto: Partial<CreateLotDto>) {
    return this.lotService.update(numbLot, updateLotDto);
  }

  @Delete(':numbLot')
  remove(@Param('numbLot') numbLot: string) {
    return this.lotService.remove(numbLot);
  }
}
