import { Message } from "../../message/model/message.model";
import { User } from "../../user/model/user.model";

export interface Thread {
    participants: User[];
    messages: Message[];
}
