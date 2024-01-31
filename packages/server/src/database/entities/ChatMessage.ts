/* eslint-disable */
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, Index, ManyToOne, OneToMany } from 'typeorm'
import { IChatMessage, MessageType } from '../../Interface'
import { User } from './User'
import { Feedback } from './Feedback'
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

    @Column({ nullable: true, type: 'text' })
    trainingContent: string

    @OneToMany(() => Feedback, (feedback) => feedback.chatMessage)
    feedbacks: Feedback[]

    @ManyToOne(() => User, (user) => user.chatMessages)
    user: User
}
