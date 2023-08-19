import { ApiProperty } from '@nestjs/swagger';

export class Tokens {
  @ApiProperty({
    description: 'the token that will allow access to the api’s resources',
  })
  access_token: string;

  @ApiProperty({
    description:
      'the token that will allow the renewal of authentication tokens',
  })
  refresh_token: string;
}
