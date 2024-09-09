import { Thread } from "../../thread/model/thread.model";
import { User } from "../../user/model/user.model";

export interface Message {
    sender: User;
    thread: Thread;
    text?: string;
    image?: string;
    isRead: boolean;
}
