import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { Test } from '@nestjs/testing';
import { UserService } from '../api/user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from '../api/user/dto/user.dto';
import { BadRequestException } from '@nestjs/common';
import { EditUserDto } from '../api/user/dto/edit-user.dto';

import * as fs from 'fs';
import { Readable } from 'stream';

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
    profilePicture: null,
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

  describe('updateProfilePicture', () => {
    const newPicture: Express.Multer.File = {
      fieldname: 'picture',
      originalname: 'profile-picture.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('file-content'),
      stream: new Readable(),
      destination: '',
      filename: '',
      path: 'new-profile-picture-path',
    };

    const updatedUser = {
      ...user,
      profilePicture: newPicture.path,
    };

    it('should not delete the old file if there is no saved profile picture', async () => {
      jest
        .spyOn(userService, 'getCurrentUser')
        .mockResolvedValueOnce(mockUserDto);

      jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
      jest.spyOn(fs, 'unlinkSync').mockImplementationOnce(() => null);

      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValueOnce(updatedUser);

      const result = await userService.updateProfilePicture(0, newPicture);

      expect(userService.getCurrentUser).toHaveBeenCalledWith(0);
      expect(fs.existsSync).not.toBeCalled();
      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 0 },
        data: { profilePicture: newPicture.path },
      });

      expect(result).toEqual(UserDto.fromUser(updatedUser));
    });

    it('should delete the old file if there is already a saved profile picture', async () => {
      const userWithProfilePicture: UserDto = {
        ...mockUserDto,
        profilePicture: 'old-profile-picture-path',
      };

      jest
        .spyOn(userService, 'getCurrentUser')
        .mockResolvedValueOnce(userWithProfilePicture);

      jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
      jest.spyOn(fs, 'unlinkSync').mockImplementationOnce(() => null);

      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValueOnce(updatedUser);

      const result = await userService.updateProfilePicture(0, newPicture);

      expect(userService.getCurrentUser).toHaveBeenCalledWith(0);
      expect(fs.existsSync).toHaveBeenCalledWith(
        userWithProfilePicture.profilePicture,
      );
      expect(fs.unlinkSync).toHaveBeenCalledWith(
        userWithProfilePicture.profilePicture,
      );
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 0 },
        data: { profilePicture: newPicture.path },
      });
      expect(result).toEqual(UserDto.fromUser(updatedUser));
    });
  });
});
