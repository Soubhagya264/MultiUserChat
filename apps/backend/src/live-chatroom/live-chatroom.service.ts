import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { User } from '../user/user.type';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class LiveChatroomService {
  private redisClient: Redis;
  private pubSub: PubSub;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redisClient = new Redis(redisUrl);
    this.pubSub = new PubSub();
  }

  // Manage live users for chatroom
  async getLiveUsersForChatroom(chatroomId: number): Promise<User[]> {
    const users = await this.redisClient.smembers(
      `liveUsers:chatroom:${chatroomId}`,
    );
    return users.map((user) => JSON.parse(user));
  }

  async addLiveUserToChatroom(chatroomId: number, user: User): Promise<void> {
    await this.redisClient.sadd(
      `liveUsers:chatroom:${chatroomId}`,
      JSON.stringify(user),
    );
  }

  async removeLiveUserFromChatroom(
    chatroomId: number,
    user: User,
  ): Promise<void> {
    await this.redisClient.srem(
      `liveUsers:chatroom:${chatroomId}`,
      JSON.stringify(user),
    );
  }

  // Manage video calls
  // async getLiveUsersForVideoRoom(videoRoomId: number): Promise<User[]> {
  //   const users = await this.redisClient.smembers(
  //     `liveUsers:videoRoom:${videoRoomId}`,
  //   );
  //   return users.map((user) => JSON.parse(user));
  // }

  // async addLiveUserToVideoRoom(videoRoomId: number, user: User): Promise<void> {
  //   const existingLiveUsers = await this.getLiveUsersForVideoRoom(videoRoomId);
  //   const existingUser = existingLiveUsers.find(
  //     (liveUser) => liveUser.id === user.id,
  //   );
  //   if (existingUser) {
  //     return;
  //   }
  //   await this.redisClient.sadd(
  //     `liveUsers:videoRoom:${videoRoomId}`,
  //     JSON.stringify(user),
  //   );
  // }

  // async removeLiveUserFromVideoRoom(
  //   videoRoomId: number,
  //   user: User,
  // ): Promise<void> {
  //   await this.redisClient
  //     .srem(`liveUsers:videoRoom:${videoRoomId}`, JSON.stringify(user))
  //     .catch((err) => {
  //       console.log('removeLiveUserFromVideoRoom error', err);
  //     })
  //     .then((res) => {
  //       console.log('removeLiveUserFromVideoRoom res', res);
  //     });
  // }

  // async startVideoCall(
  //   videoRoomId: number,
  //   initiatorId: number,
  // ): Promise<void> {
  //   const liveUsers = await this.getLiveUsersForVideoRoom(videoRoomId);
  //   liveUsers.forEach(async (user) => {
  //     if (user.id !== initiatorId) {
  //       await this.pubSub.publish(`videoCallNotification.${videoRoomId}`, {
  //         videoCallNotification: { initiatorId, receiverId: user.id },
  //       });
  //     }
  //   });
  // }

  // async handleOffer(
  //   videoRoomId: number,
  //   offer: string,
  //   senderId: number,
  // ): Promise<void> {
  //   const liveUsers = await this.getLiveUsersForVideoRoom(videoRoomId);
  //   liveUsers.forEach(async (user) => {
  //     if (user.id !== senderId) {
  //       await this.pubSub.publish(`offer.${videoRoomId}`, {
  //         offer: { offer, senderId, receiverId: user.id },
  //       });
  //     }
  //   });
  // }

  // async handleAnswer(
  //   videoRoomId: number,
  //   answer: string,
  //   senderId: number,
  // ): Promise<void> {
  //   const liveUsers = await this.getLiveUsersForVideoRoom(videoRoomId);
  //   liveUsers.forEach(async (user) => {
  //     if (user.id !== senderId) {
  //       await this.pubSub.publish(`answer.${videoRoomId}`, {
  //         answer: { answer, senderId, receiverId: user.id },
  //       });
  //     }
  //   });
  // }

  // async handleIceCandidate(
  //   videoRoomId: number,
  //   answer: string,
  //   senderId: number,
  // ): Promise<void> {
  //   const liveUsers = await this.getLiveUsersForVideoRoom(videoRoomId);
  //   liveUsers.forEach(async (user) => {
  //     if (user.id !== senderId) {
  //       await this.pubSub.publish(`icecandidate.${videoRoomId}`, {
  //         answer: { answer, senderId, receiverId: user.id },
  //       });
  //     }
  //   });
  // }
}
