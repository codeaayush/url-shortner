import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'urls' })
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  originalUrl: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  shortCode: string;

  @Column({ type: 'int', default: 0 })
  
  clickCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
