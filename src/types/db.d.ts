interface User {
  name: string;
  email: string;
  image: string;
  id: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: number;
}

interface FriendRequest {
  id: string;
  senderId: string;
  senderEmail: string;
}

interface ChatMessages {
  id: string;
  messages: Message[];
}
