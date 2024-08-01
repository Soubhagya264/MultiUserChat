import { InputType, Field, ObjectType, Int, Float } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

// Define the payload types for subscriptions
@ObjectType()
export class OfferPayload {
  @Field()
  offer: string;

  @Field(() => Float)
  userId: number;
}

@ObjectType()
export class VideoCallNotificationPayload {
  @Field(() => Int)
  initiatorId: number;

  @Field(() => Int)
  receiverId: number;
}

@ObjectType()
export class AnswerPayload {
  @Field()
  answer: string;

  @Field(() => Float)
  userId: number;
}

@ObjectType()
export class IceCandidatePayload {
  @Field(() => GraphQLJSON)
  candidate: any;

  @Field(() => Float)
  userId: number;
}

