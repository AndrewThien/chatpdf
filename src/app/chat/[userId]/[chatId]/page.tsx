import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";

import { db } from "@/lib/db";
import { chats, users } from "@/lib/db/schema";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    userID: string;
    chatId: string;
  };
};

const ChatPage = async ({ params: { userID, chatId } }: Props) => {

  const chatIdNumber = typeof chatId === 'string' ? parseInt(chatId, 10) : chatId;
  
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  const existingUser = await db.select().from(users).where(eq(users.user_id, userId));
  const active_user_id = existingUser[0].id;

  const _chats = await db.select().from(chats).where(eq(chats.user_id, active_user_id));
  if (!_chats) {
    return redirect("/");
  }
  if (!_chats.find((chat) => chat.id === chatIdNumber)) {
    return redirect("/");
  }


  const currentChat = _chats.find((chat) => chat.id === chatIdNumber);
  const isPro = await checkSubscription();

  return (
    <div className= "flex max-h-screen">
      <div className="flex w-full max-h-screen">
        <div className="flex-[3] max-w-xs">
          <ChatSideBar chats={_chats} userId={active_user_id} chatId={chatIdNumber} isPro= {isPro} />
        </div>
        <div className="max-h-screen p-4 flex-[5]">
          <PDFViewer pdf_url={currentChat?.pdf_url || ""} />
        </div>
        <div className="flex-[3] border-l-4 border-l-slate-200 overflow-scroll">
          <ChatComponent chatId={chatIdNumber} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;