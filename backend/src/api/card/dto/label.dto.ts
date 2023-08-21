import { Label } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class LabelDto {
  @ApiProperty({
    example: 29,
    description: 'is the label id',
  })
  id: number;

  @ApiProperty({
    example: 'application',
    description: 'is the name of the label',
  })
  name: string;

  @ApiProperty({
    example: '#E36397',
    description: 'is the identification color of the labels',
  })
  color: string;

  constructor(label: Label) {
    this.id = label.id;
    this.name = label.name;
    this.color = label.color;
  }
}
