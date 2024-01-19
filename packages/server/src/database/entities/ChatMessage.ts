/* eslint-disable */
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, Index, ManyToOne } from 'typeorm'
import { IChatMessage, MessageType } from '../../Interface'
import { User } from './User'
@Entity()
export class ChatMessage implements IChatMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    role: MessageType

    @Index()
    @Column()
    chatflowid: string

    @Column({ type: 'text' })
    content: string

    @Column({ nullable: true, type: 'text' })
    sourceDocuments?: string

    @Column({ nullable: true, type: 'text' })
    usedTools?: string

    @Column({ nullable: true, type: 'text' })
    fileAnnotations?: string

    @Column()
    chatType: string

    @Column()
    chatId: string

    @Column({ nullable: true })
    memoryType?: string

    @Column({ nullable: true })
    sessionId?: string

    @CreateDateColumn()
    createdDate: Date

    @ManyToOne(() => User, (user) => user.chatMessages)
    user: User
}
