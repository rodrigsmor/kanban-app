import { AttachmentEnum } from '../enums';
import { ApiProperty } from '@nestjs/swagger';
import { AttachmentType } from './attachment.type';
import { CommentPrismaType } from './payloads.type';
import { UserDto } from '../../api/user/dto/user.dto';

export class CommentDto {
  @ApiProperty({
    example: 12,
    description: 'the id of the comment',
  })
  id: number;

  @ApiProperty({
    example:
      'Great progress! Keep up the good work and let’s get this task done.',
    description: 'the content of the comment, i.e. the text of the comment',
  })
  content: string;

  @ApiProperty({
    example: {
      id: 782,
      email: 'maria.silva@example.com',
      firstName: 'Maria',
      lastName: 'da Silva Souza',
      profilePicture: 'path/to/maria-silva.jpg',
    },
    description: 'the member who commented on the card',
  })
  author: UserDto;

  @ApiProperty({
    isArray: true,
    example: [
      {
        id: 192,
        path: 'http://example.com/example?query=ex',
        title: 'links to help you complete this task',
        type: AttachmentEnum.LINK,
      },
    ],
    description: 'the attachments added to this comment',
  })
  attachments?: AttachmentType[];

  @ApiProperty({
    description: 'the date this comment was created.',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'the date when the last update was made to this comment.',
  })
  updateAt: Date;

  constructor(comment: CommentPrismaType) {
    this.id = comment.id;
    this.content = comment.content;
    this.attachments = comment.attachments.map(
      (attachment) => new AttachmentType(attachment),
    );
    this.author = UserDto.fromUser(comment.author);
  }
}
