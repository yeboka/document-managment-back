import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @ApiProperty({ example: 1, description: 'Unique ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'john_doe', description: 'Username' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ example: '$2b$10$hashed_password...', description: 'Hashed Password' })
  @Column()
  password: string;
}
