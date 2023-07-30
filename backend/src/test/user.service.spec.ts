import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { Test } from '@nestjs/testing';
import { UserService } from '../api/user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from '../api/user/dto/user.dto';
import { BadRequestException } from '@nestjs/common';
import { EditUserDto } from '../api/user/dto/edit-user.dto';

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

    it('should throw BadRequestException when getCurrentUser data fails', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      expect(userService.getCurrentUser(0)).rejects.toThrowError(
        BadRequestException,
      );
      expect(prismaService.user.findUnique).toBeCalledWith({
        where: { id: 0 },
      });
    });
  });

  describe('updateUser', () => {
    const newUserData: EditUserDto = {
      firstName: 'New user name',
      lastName: 'New user last name',
    };

    it('should throw BadRequestException if the user does not exist', async () => {
      jest
        .spyOn(userService, 'getCurrentUser')
        .mockImplementationOnce(() => null);
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(prismaService.user, 'update').mockResolvedValueOnce(null);

      await expect(userService.updateUser(0, newUserData)).rejects.toThrowError(
        BadRequestException,
      );

      expect(prismaService.user.findUnique).not.toBeCalled();
      expect(prismaService.user.update).not.toBeCalled();
    });

    it('should update the user with provided data', async () => {
      const updatedUserData: UserDto = {
        ...mockUserDto,
        ...newUserData,
      };

      jest
        .spyOn(userService, 'getCurrentUser')
        .mockImplementationOnce(async () => mockUserDto);
      jest.spyOn(prismaService.user, 'update').mockResolvedValueOnce({
        ...user,
        ...newUserData,
      });

      const result = await userService.updateUser(0, newUserData);

      expect(result).toEqual(updatedUserData);
      expect(prismaService.user.update).toBeCalledWith({
        where: { id: 0 },
        data: {
          firstName: newUserData.firstName,
          lastName: newUserData.lastName,
        },
      });
    });

    it('should only update the fields provided', async () => {
      const newUserDataReduce: EditUserDto = {
        lastName: 'Last name updated',
      };

      const updatedUserData: UserDto = {
        ...mockUserDto,
        ...newUserDataReduce,
      };

      jest
        .spyOn(userService, 'getCurrentUser')
        .mockImplementationOnce(async () => mockUserDto);
      jest.spyOn(prismaService.user, 'update').mockResolvedValueOnce({
        ...user,
        ...newUserDataReduce,
      });

      const result = await userService.updateUser(0, newUserDataReduce);

      expect(result).toEqual(updatedUserData);
      expect(prismaService.user.update).toBeCalledWith({
        where: { id: 0 },
        data: {
          lastName: newUserDataReduce.lastName,
        },
      });
    });
  });
});
