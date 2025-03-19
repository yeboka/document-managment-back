import { Controller, Post, Body, UseGuards, Request, Param, Delete, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DocumentService } from './document.service';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { Document } from './document.entity';
import { User } from '../auth/user.entity';


class DocumentCreateDto {
  @ApiProperty({ example: 'New Document', description: 'title of the future document' })
  title: string;
}

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  // Эндпоинт для создания документа
  @ApiOperation({ summary: 'Create a new document' })
  @ApiBody({type: DocumentCreateDto})
  @ApiResponse({ status: 201, description: 'Document successfully created', type: Document })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createDocument(@Request() req, @Body() body: DocumentCreateDto) {
    const user = req.user;  // Получаем авторизованного пользователя
    console.log("GET AUTHB USER: ", req.user.userId)
    return this.documentService.createDocument(body.title, req.user.userId);
  }

  @ApiOperation({ summary: 'Get all documents of a user' })
  @ApiResponse({ status: 200, description: 'List of documents', type: [Document] })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getAllDocuments(@Param('userId') userId: number) {
    return this.documentService.getAllDocumentsByUser(userId);
  }

  // Эндпоинт для получения одного документа пользователя
  @ApiOperation({ summary: 'Get a specific document of a user' })
  @ApiResponse({ status: 200, description: 'Document found', type: Document })
  @ApiResponse({ status: 404, description: 'Document or user not found' })
  @Get('user/:userId/:documentId')
  @UseGuards(AuthGuard('jwt'))
  async getDocument(@Param('userId') userId: number, @Param('documentId') documentId: number) {
    return this.documentService.getDocumentByUserAndId(userId, documentId);
  }

  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteDocument(@Param('id') id: number) {
    await this.documentService.deleteDocument(id);
    return { message: 'Document deleted successfully' };
  }

  // Эндпоинт для отправки документа на утверждение
  @ApiOperation({ summary: 'Send document for approval' })
  @ApiResponse({ status: 200, description: 'Document sent for approval', type: Document })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @Post(':id/approve')
  @UseGuards(AuthGuard('jwt'))
  async sendForApproval(@Param('id') id: number) {
    return this.documentService.sendForApproval(id);
  }

  // Эндпоинт для подписания документа
  @ApiOperation({ summary: 'Sign document' })
  @ApiResponse({ status: 200, description: 'Document signed successfully', type: Document })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 400, description: 'Document cannot be signed' })
  @Post(':id/sign')
  @UseGuards(AuthGuard('jwt'))
  async signDocument(@Request() req, @Param('id') id: number) {
    const user: User = req.user;
    return this.documentService.signDocument(id, user);
  }
}
