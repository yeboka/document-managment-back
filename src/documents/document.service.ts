import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus } from './document.entity';
import { User } from '../auth/user.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document) private documentRepository: Repository<Document>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  // Метод для создания документа
  // Метод для создания документа
  async createDocument(title: string, userId: number): Promise<Document> {
    console.log("REPO USER: ", userId);

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const document = this.documentRepository.create({
      title,
      created_by: user,
      status: DocumentStatus.CREATED,
    });

    try {
      return await this.documentRepository.save(document);
    } catch (error) {
      throw new Error('Error saving document');
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
  async sendForApproval(id: number): Promise<Document> {
    const document = await this.documentRepository.findOne({where: {id}});
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document.send_for_approval();
  }

  // Метод для подписания документа
  async signDocument(id: number, user: User): Promise<Document> {
    const document = await this.documentRepository.findOne({where: {id}});
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document.sign_document(user);
  }
}
