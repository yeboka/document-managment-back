import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum Role {
  ADMIN = 'admin',
  SUPER_MANAGER = 'super_manager',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

@Entity()
export class User {
  @ApiProperty({ example: 1, description: 'Unique ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '$2b$10$hashed_password...', description: 'Hashed Password' })
  @Column()
  password: string;

  @ApiProperty({ example: 'John', description: 'First Name' })
  @Column()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last Name' })
  @Column()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: Role.EMPLOYEE, description: 'Role of the user' })
  @Column({ type: 'enum', enum: Role, default: Role.EMPLOYEE })
  role: Role;
}
