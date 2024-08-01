import { gql } from "@apollo/client"

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($messageId: Float!,$chatroomId: Float!) {
    deleteMessage(messageId: $messageId,chatroomId: $chatroomId)
  }
`