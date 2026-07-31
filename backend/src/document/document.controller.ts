import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt-auth.guard';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto, @CurrentUser() user?: AuthenticatedUser) {
    return this.documentService.create(createDocumentDto, user?.email);
  }

  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @Get(':numbLot')
  findOne(@Param('numbLot') numbLot: string) {
    return this.documentService.findOne(numbLot);
  }

  @Put(':numbLot')
  upsert(
    @Param('numbLot') numbLot: string,
    @Body() updateDocumentDto: Partial<CreateDocumentDto>,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.documentService.upsert(numbLot, updateDocumentDto, user?.email);
  }

  @Patch(':numbLot')
  update(
    @Param('numbLot') numbLot: string,
    @Body() updateDocumentDto: Partial<CreateDocumentDto>,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.documentService.update(numbLot, updateDocumentDto, user?.email);
  }

  @Delete(':numbLot')
  remove(@Param('numbLot') numbLot: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.documentService.remove(numbLot, user?.email);
  }
}
