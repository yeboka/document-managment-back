import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum DocumentStatus {
  CREATED = 'created',
  PENDING_SIGNATURE = 'pending_signature',
  SIGNED = 'signed',
  DELETED = 'deleted',
}

@Entity()
export class Document {
  @ApiProperty({ description: 'Unique identifier of the document', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Title of the document', example: 'Contract' })
  @Column()
  title: string;

  @ApiProperty({
    description: 'Current status of the document',
    example: DocumentStatus.CREATED,
    enum: DocumentStatus
  })
  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.CREATED })
  status: DocumentStatus;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  @ApiProperty({ description: 'User who created the document', type: () => User })
  created_by: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  @ApiProperty({ description: 'User who updated or signed the document', type: () => User, nullable: true })
  updated_by: User;

  // Методы

  async send_for_approval() {
    if (this.status === DocumentStatus.CREATED) {
      this.status = DocumentStatus.PENDING_SIGNATURE;
      return this;
    }
    throw new Error('Document cannot be sent for approval');
  }

  async sign_document(user: User) {
    if (this.status === DocumentStatus.PENDING_SIGNATURE) {
      this.status = DocumentStatus.SIGNED;
      this.updated_by = user;
      return this;
    }
    throw new Error('Document cannot be signed');
  }
}
