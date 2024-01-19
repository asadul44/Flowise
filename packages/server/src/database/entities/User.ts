/* eslint-disable */
import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Index, OneToMany } from 'typeorm'
import { IUser } from '../../Interface'
import { ChatMessage } from './ChatMessage'
@Entity()
export class User implements IUser {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    email: string

    @Column({ nullable: true })
    phone: string

    @Column({ nullable: true })
    company: string

    @Column({ nullable: true })
    image?: string

    @Index()
    @Column()
    chatflowid: string

    @Index()
    @Column()
    chatId: string

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date

    @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.user)
    chatMessages: ChatMessage[]
}
