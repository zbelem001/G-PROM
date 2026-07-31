import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt-auth.guard';
import { LotService } from './lot.service';
import { CreateLotDto } from './dto/create-lot.dto';

@UseGuards(JwtAuthGuard)
@Controller('lots')
export class LotController {
  constructor(private readonly lotService: LotService) {}

  @Post()
  create(@Body() createLotDto: CreateLotDto, @CurrentUser() user?: AuthenticatedUser) {
    return this.lotService.create(createLotDto, user?.email);
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
  update(
    @Param('numbLot') numbLot: string,
    @Body() updateLotDto: Partial<CreateLotDto>,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.lotService.update(numbLot, updateLotDto, user?.email);
  }

  @Delete(':numbLot')
  remove(@Param('numbLot') numbLot: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.lotService.remove(numbLot, user?.email);
  }
}
