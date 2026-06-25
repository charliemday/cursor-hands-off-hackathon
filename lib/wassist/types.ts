export type WassistInboundPayload = {
  message: string;
  image: string | null;
  phone_number: string;
  reply_callback: string;
};

export type WassistReplyBody = {
  content: string;
  image?: string;
};
