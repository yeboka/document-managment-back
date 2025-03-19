import { Controller, Post, Body, UseGuards, Request, Param, Delete, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DocumentService } from './document.service';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { Document } from './document.entity';
import { User } from '../auth/user.entity';
import { Approval, ApprovalDecision } from "../approval/approvel.entity";


class DocumentCreateDto {
  @ApiProperty({ example: 'New Document', description: 'title of the future document' })
  title: string;
}

class ApproveDto {
  @ApiProperty({ example: ApprovalDecision.APPROVED, description: 'decision of request' })
  decision: ApprovalDecision;
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

  // Эндпоинт для отправки документа на подпись
  @ApiOperation({ summary: 'Send document for signature' })
  @ApiResponse({ status: 201, description: 'Document sent for signature', type: Approval })
  @ApiResponse({ status: 404, description: 'Document or approver not found' })
  @Post(':documentId/send-for-signature/:approverId')
  @UseGuards(AuthGuard('jwt'))
  async sendForSignature(@Request() req, @Param('documentId') documentId: number, @Param('approverId') approverId: number) {
    return this.documentService.sendForSignature(documentId, approverId, req.user.userId);
  }

  // Эндпоинт для обработки решения о подписании
  @ApiOperation({ summary: 'Handle approval decision' })
  @ApiResponse({ status: 200, description: 'Approval decision processed', type: Approval })
  @ApiResponse({ status: 404, description: 'Approval not found' })
  @ApiBody({type: ApproveDto})
  @Post('approval/:approvalId/decision')
  @UseGuards(AuthGuard('jwt'))
  async handleApprovalDecision(@Param('approvalId') approvalId: number, @Body() body: ApproveDto) {
    return this.documentService.handleApprovalDecision(approvalId, body.decision);
  }
}
