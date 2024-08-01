import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as fs from 'fs';
import { join } from 'path';
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async getUser(userId: number) {
    return await this.prisma.user.findUnique({ where: { id: userId } });
  }

  async getAllUsers(fullname: string, userId: number) {
    return this.prisma.user.findMany({
      where: {
        id: {
          not: userId,
        },
        fullname: {
          contains: fullname,
        },
      },
    });
  }

  async updateProfile(userId: number, fullname: string, avatarUrl: string) {
    if (avatarUrl) {
      const oldUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          fullname,
          avatarUrl,
        },
      });

      if (oldUser.avatarUrl) {
        const imageName = oldUser.avatarUrl.split('/').pop();
        const imagePath = join(
          __dirname,
          '..',
          '..',
          'public',
          'images',
          imageName,
        );
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      return updatedUser;
    }
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullname,
      },
    });
  }

  async getUsersOfChatroom(chatroomId: number) {
    return this.prisma.user.findMany({
      where: {
        chatrooms: {
          some: {
            id: chatroomId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
