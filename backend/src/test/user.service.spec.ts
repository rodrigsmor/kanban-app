import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { Test } from '@nestjs/testing';
import { UserService } from '../api/user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from '../api/user/dto/user.dto';

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  const password = bcrypt.hashSync('test-password', 10);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  const user: User = {
    id: 0,
    email: 'user@test.com',
    firstName: 'Test first name',
    lastName: 'Test last name',
    isAdmin: false,
    password,
    profilePicture: 'path-to-picture',
  };

  const mockUserDto = UserDto.fromUser(user);

  describe('getCurrentUser', () => {
    it('should return the user data by id', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(user);
      const currentUser = await userService.getCurrentUser(0);

      expect(currentUser).toEqual(mockUserDto);
      expect(prismaService.user.findUnique).toBeCalledWith({
        where: { id: 0 },
      });
    });
  });
});
