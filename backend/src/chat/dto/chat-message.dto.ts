export class ChatHistoryItemDto {
  role: 'user' | 'assistant';
  content: string;
}

export class SendChatMessageDto {
  message: string;
  history?: ChatHistoryItemDto[];
}
