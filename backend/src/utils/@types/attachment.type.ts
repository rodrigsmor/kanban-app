import { ApiProperty } from '@nestjs/swagger';
import { AttachmentEnum } from '../enums';
import { Attachment } from '@prisma/client';

export class AttachmentType {
  @ApiProperty({
    example: 13,
    description: 'is the id of the attachment',
  })
  id: number;

  @ApiProperty({
    example: '/files/example-file.pdf',
    description: 'is the path to the file',
  })
  path: string;

  @ApiProperty({
    required: false,
    example: 'is a title to the attachment',
  })
  title?: string;

  @ApiProperty({
    example: AttachmentEnum.FILE,
    description: 'the type of attachment, which can be File or Link',
  })
  type: AttachmentEnum;

  constructor(attachment: Attachment) {
    this.id = attachment.id;
    this.path = attachment.path;
    this.title = attachment.title;
    this.type = attachment.type as AttachmentEnum;
  }
}
