import { ApiProperty } from '@nestjs/swagger';

export class CreateCardDto {
  @ApiProperty({
    required: true,
    example: '🔜 Write the project README',
  })
  title: string;

  @ApiProperty({
    example: 0,
    required: true,
    description: 'the id of the column the card is part of',
  })
  columnId: number;

  @ApiProperty({
    required: false,
    description:
      'This field is the card’s description, allowing Markdown-formatted text.',
    example:
      'Create an informative and concise project README that outlines key features, installation steps, and usage instructions. Give users a clear roadmap to understand and engage with your project effectively.',
  })
  description?: string;
}
