import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(createDocumentDto);
  }

  @Get()
  findAll() {
    return this.documentService.findAll();
  }

  @Get(':numbLot')
  findOne(@Param('numbLot') numbLot: string) {
    return this.documentService.findOne(numbLot);
  }

  @Patch(':numbLot')
  update(@Param('numbLot') numbLot: string, @Body() updateDocumentDto: Partial<CreateDocumentDto>) {
    return this.documentService.update(numbLot, updateDocumentDto);
  }

  @Delete(':numbLot')
  remove(@Param('numbLot') numbLot: string) {
    return this.documentService.remove(numbLot);
  }
}
