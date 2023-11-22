"use client"
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { MessageCircle, PlusCircle, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import SubscriptionButton from "./SubscriptionButton";

type Props = {
  chats: DrizzleChat[];
  userId: number;
  chatId: number;
  isPro: boolean
};

const ChatSideBar = ({ chats, userId, chatId, isPro }: Props) => {
  const [loading, setLoading] = React.useState(false);


    const handleSubscription = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/stripe")
        window.location.href = response.data.url;
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false)
      }
    }
  
    return (
      <div className="lex items-center h-screen w-full soff p-4 text-gray-200 bg-gray-900">
        <div className="flex items-center text-sm text-slate-500 gap-2 mb-5 ml-2">
          <Link href='/'>
            <Button>Home <Home className="ml-2" /></Button>
          </Link>
          <SubscriptionButton isPro={isPro} />
        </div>
        <Link href="/">
          <Button className="w-full border-dashed border-white border">
            <PlusCircle className="mr-2 w-4 h-4" />
            New Chat
          </Button>
        </Link>
        <div className="flex h-full w-full pb-20 flex-col gap-2 mt-4">
          {chats.map((chat) => (
            <Link key={chat.id} href={`/chat/${userId}/${chat.id}`}>
              <div className={cn("rounded-lg p-3 text-slate-300 flex items-center", {
                "bg-blue-600 text-white": chat.id === chatId,
                "hover:text-white": chat.id !== chatId,
              })}>
                <MessageCircle className="mr-2" />
                <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                  {chat.pdf_name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
    
};

export default ChatSideBar;