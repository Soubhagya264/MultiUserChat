import {
  Resolver,
  Mutation,
  Subscription,
  Args,
  Context,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { User } from 'src/user/user.type';
import { LiveChatroomService } from './live-chatroom.service';
import { UserService } from 'src/user/user.service';
import { UseFilters, UseGuards } from '@nestjs/common';
import { GQLErrorFilter } from 'src/CustomGQLFilter/GQLError';

import {
  OfferPayload,
  AnswerPayload,
  IceCandidatePayload,
  VideoCallNotificationPayload,
} from 'src/graphQL';
import GraphQLJSON from 'graphql-type-json';
import { Request } from 'express';
import { GraphqlAuthGuard } from 'src/auth/graphQL-auth-guards';

@Resolver()
export class LiveChatroomResolver {
  private pubSub: PubSub;

  constructor(
    private readonly liveChatroomService: LiveChatroomService,
    private readonly userService: UserService,
  ) {
    this.pubSub = new PubSub();
  }

  // Subscription for live users in a chatroom
  @Subscription(() => [User], {
    nullable: 'items',
    resolve: (value) => value.liveUsers,
    filter: (payload, variables) => payload.chatroomId === variables.chatroomId,
  })
  liveUsersInChatroom(@Args('chatroomId') chatroomId: number) {
    return this.pubSub.asyncIterator(`liveUsersInChatroom.${chatroomId}`);
  }

  @Subscription(() => [User], {
    nullable: 'items',
    resolve: (value) => value.liveUsers,
    filter: (payload, variables) =>
      payload.videoRoomId === variables.videoRoomId,
  })
  liveUsersInVideoRoom(@Args('videoRoomId') videoRoomId: number) {
    return this.pubSub.asyncIterator(`liveUsersInVideoRoom.${videoRoomId}`);
  }

  // Mutation to enter a chatroom
  

  @UseFilters(GQLErrorFilter)
  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Boolean)
  async enterChatroom(
    @Args('chatroomId') chatroomId: number,
    @Context() context: { req: Request },
  ) {
    const user = await this.userService.getUser(context.req.user.sub);
    await this.liveChatroomService.addLiveUserToChatroom(chatroomId, user);

    const liveUsers =
      await this.liveChatroomService.getLiveUsersForChatroom(chatroomId);
    await this.pubSub.publish(`liveUsersInChatroom.${chatroomId}`, {
      liveUsers,
      chatroomId,
    });
    return true;
  }
 
  // Mutation to leave a chatroom
  @UseFilters(GQLErrorFilter)
  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Boolean)
  async leaveChatroom(
    @Args('chatroomId') chatroomId: number,
    @Context() context: { req: Request },
  ) {
    const user = await this.userService.getUser(context.req.user.sub);
    await this.liveChatroomService.removeLiveUserFromChatroom(chatroomId, user);

    const liveUsers =
      await this.liveChatroomService.getLiveUsersForChatroom(chatroomId);
    await this.pubSub.publish(`liveUsersInChatroom.${chatroomId}`, {
      liveUsers,
      chatroomId,
    });

    return true;
  }

  // @UseFilters(GQLErrorFilter)
  // @UseGuards(GraphqlAuthGuard)
  // @Mutation(() => Boolean)
  // async enterVideoRoom(
  //   @Args('videoRoomId') videoRoomId: number,
  //   @Context() context: { req: Request },
  // ) {
  //   const user = await this.userService.getUser(context.req.user.sub);
  //   await this.liveChatroomService.addLiveUserToVideoRoom(videoRoomId, user);

  //   const liveUsers =
  //     await this.liveChatroomService.getLiveUsersForVideoRoom(videoRoomId);
  //   await this.pubSub.publish(`liveUsersInVideoRoom.${videoRoomId}`, {
  //     liveUsers,
  //     videoRoomId,
  //   });
  //   return true;
  // }
  // @UseFilters(GQLErrorFilter)
  // @UseGuards(GraphqlAuthGuard)
  // @Mutation(() => Boolean)
  // async leaveVideoRoom(
  //   @Args('videoRoomId') videoRoomId: number,
  //   @Context() context: { req: Request },
  // ) {
  //   const user = await this.userService.getUser(context.req.user.sub);
  //   await this.liveChatroomService.removeLiveUserFromVideoRoom(
  //     videoRoomId,
  //     user,
  //   );

  //   const liveUsers =
  //     await this.liveChatroomService.getLiveUsersForVideoRoom(videoRoomId);
  //   await this.pubSub.publish(`liveUsersInChatroom.${videoRoomId}`, {
  //     liveUsers,
  //     videoRoomId,
  //   });

  //   return true;
  // }
  // // Subscription for video call notifications
  // @Subscription(() => VideoCallNotificationPayload, {
  //   filter: (payload, variables) =>
  //     payload.videoCallNotification.videoRoomId === variables.videoRoomId,
  // })
  // videoCallNotification(@Args('videoRoomId') videoRoomId: number) {
  //   return this.pubSub.asyncIterator(`videoCallNotification.${videoRoomId}`);
  // }

  // // Subscription for offers
  // @Subscription(() => OfferPayload, {
  //   filter: (payload, variables) => payload.userId !== variables.userId,
  // })
  // OnOffer(@Args('videoRoomId') videoRoomId: number) {
  //   return this.pubSub.asyncIterator(`offer.${videoRoomId}`);
  // }

  // // Subscription for answers
  // @Subscription(() => AnswerPayload, {
  //   filter: (payload, variables) => payload.userId !== variables.userId,
  // })
  // OnAnswer(@Args('videoRoomId') videoRoomId: number) {
  //   return this.pubSub.asyncIterator(`answer.${videoRoomId}`);
  // }

  // // Subscription for ICE candidates
  // @Subscription(() => IceCandidatePayload, {
  //   filter: (payload, variables) => payload.userId !== variables.userId,
  // })
  // OnIceCandidate(@Args('videoRoomId') videoRoomId: number) {
  //   return this.pubSub.asyncIterator(`iceCandidate.${videoRoomId}`);
  // }

  // // Mutation to send an offer
  // @UseFilters(GQLErrorFilter)
  // @UseGuards(GraphqlAuthGuard)
  // @Mutation(() => Boolean)
  // async sendOffer(
  //   @Args('videoRoomId') videoRoomId: number,
  //   @Args('offer') offer: string,
  //   @Context() context: { req: Request },
  // ) {
  //   const user = await this.userService.getUser(context.req.user.sub);
  //   await this.liveChatroomService.handleOffer(videoRoomId, offer, user.id);
  //   return true;
  // }

  // // Mutation to send an answer
  // @UseFilters(GQLErrorFilter)
  // @UseGuards(GraphqlAuthGuard)
  // @Mutation(() => Boolean)
  // async sendAnswer(
  //   @Args('videoRoomId') videoRoomId: number,
  //   @Args('answer') answer: string,
  //   @Context() context: { req: Request },
  // ) {
  //   const user = await this.userService.getUser(context.req.user.sub);
  //   await this.liveChatroomService.handleAnswer(videoRoomId, answer, user.id);
  //   return true;
  // }

  // // Mutation to send an ICE candidate
  // @UseFilters(GQLErrorFilter)
  // @UseGuards(GraphqlAuthGuard)
  // @Mutation(() => Boolean)
  // async sendIceCandidate(
  //   @Args('videoRoomId') videoRoomId: number,
  //   @Args('candidate', { type: () => GraphQLJSON }) candidate: any,
  //   @Context() context: { req: Request },
  // ) {
  //   const user = await this.userService.getUser(context.req.user.sub);
  //   await this.liveChatroomService.handleIceCandidate(
  //     videoRoomId,
  //     candidate,
  //     user.id,
  //   );
  //   return true;
  // }

  // @UseFilters(GQLErrorFilter)
  // @UseGuards(GraphqlAuthGuard)
  // @Mutation(() => Boolean)
  // async startVideoCall(
  //   @Args('videoRoomId') videoRoomId: number,
  //   @Context() context: { req: Request },
  // ) {
  //   const initiator = await this.userService.getUser(context.req.user.sub);
  //   await this.liveChatroomService.startVideoCall(videoRoomId, initiator.id);
  //   return true;
  // }
}
