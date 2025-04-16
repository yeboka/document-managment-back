import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus } from './document.entity';
import { User } from '../auth/user.entity';
import { Approval, ApprovalDecision } from "../approval/approvel.entity";
import { S3Service } from '../common/aws/s3.service';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document) private documentRepository: Repository<Document>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Approval) private approvalRepository: Repository<Approval>,
    private readonly s3Service: S3Service

  ) {}

  // Метод для создания документа
  // Метод для создания документа
  async createDocument(title: string, userId: number, file: Express.Multer.File): Promise<Document> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      // Загружаем файл в S3
      const { originalname, buffer, mimetype } = file;
      const url = await this.s3Service.uploadFile(buffer, originalname, mimetype);

      // Создаем новый документ с ссылкой на файл
      const document = this.documentRepository.create({
        title,
        created_by: user,
        status: DocumentStatus.CREATED,
        file_url: url,  // Сохраняем ссылку на файл
      });

      return await this.documentRepository.save(document);
    } catch (error) {
      throw new Error('Error uploading file to S3');
    }
  }


  async getAllDocumentsByUser(userId: number): Promise<Document[]> {
    // Проверяем, существует ли пользователь
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Возвращаем все документы, созданные этим пользователем
    return this.documentRepository.find({ where: { created_by: user } });
  }

  // Геттер для одного документа пользователя
  async getDocumentByUserAndId(userId: number, documentId: number): Promise<Document> {
    // Проверяем, существует ли пользователь
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Ищем документ с указанным ID и проверяем, принадлежит ли он пользователю
    const document = await this.documentRepository.findOne({
      where: { id: documentId, created_by: user }
    });

    if (!document) {
      throw new NotFoundException('Document not found for this user');
    }

    return document;
  }

  async deleteDocument(id: number): Promise<void> {
    const document = await this.documentRepository.findOne({ where: { id } });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.documentRepository.remove(document);
  }

  // Метод для отправки документа на утверждение
  async sendForSignature(documentId: number, approverId: number, requesterId: number): Promise<Approval> {
    const document = await this.documentRepository.findOne({ where: { id: documentId } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if  (requesterId === approverId) {
      throw new Error('The same approver and requester ids');
    }


    const approver = await this.userRepository.findOne({ where: { id: approverId } });
    if (!approver) {
      throw new NotFoundException('Approver not found');
    }

    const requester = await this.userRepository.findOne({ where: { id: requesterId } });
    if (!requester) {
      throw new NotFoundException('Requester not found');
    }


    // Создаем запись о запросе на подпись
    const approval = this.approvalRepository.create({
      document,
      approver,
      requester,
      decision: ApprovalDecision.PENDING,
    });
    console.log("change status and create approval")
    let changedDoc = document.send_for_approval()
    await this.documentRepository.update(document.id, changedDoc)
    await this.approvalRepository.save(approval);

    return approval;
  }

  // Метод для обработки решения (подписать или отклонить)
  async handleApprovalDecision(approvalId: number, decision: ApprovalDecision): Promise<Approval> {
    const approval = await this.approvalRepository.findOne({ where: { id: approvalId }, relations: ['document', 'approver'] });
    if (!approval) {
      throw new NotFoundException('Approval not found');
    }

    // Обработка решения
    if (decision === ApprovalDecision.APPROVED) {
      await approval.approve();
      let document = await  this.documentRepository.findOne({where: {id: approval.document.id}})
      if (!document) {
        throw new NotFoundException('Document not found');
      }
      let changedDoc = document.sign_document(approval.approver); // Переход к подписанию документа// Если документ утвержден, подписываем его
      await this.documentRepository.update(document.id, changedDoc)

    } else if (decision === ApprovalDecision.REJECTED) {
      await approval.reject();  // Если отклонено
    }

    await this.approvalRepository.save(approval);  // Сохраняем изменения в решении
    return approval;
  }


  async uploadDocumentFile(file: Express.Multer.File): Promise<{ url: string }> {
    const { originalname, buffer, mimetype } = file;
    const url = await this.s3Service.uploadFile(buffer, originalname, mimetype);
    return { url };
  }
}
