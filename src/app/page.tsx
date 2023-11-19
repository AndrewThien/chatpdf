import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/app-beta";
import Link from 'next/link'
import { ArrowRight, LogIn } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { checkSubscription } from "@/lib/subscription";
import SubscriptionButton from "@/components/SubscriptionButton";
import { chats } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";


export default async function Home() {
  const {userId} = await auth()
  const isAuth = !!userId;
  const isPro = await checkSubscription();
  let firstChat;
  if (userId) {
    firstChat = await db.select().from(chats).where(eq(chats.user_id, userId));
    if (firstChat) {
      firstChat = firstChat[0];
    }
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Chat with any Pdf</h1>
            <UserButton afterSignOutUrl="/"></UserButton>

          </div>
          <div className="flex mt-2">
           {isAuth && firstChat &&
           <Link href={`/chat/${firstChat.id}`}><Button>Go to chats <ArrowRight className="ml-2" /></Button></Link>  } 
           <div className="ml-3">
                  <SubscriptionButton isPro={isPro} />
                </div>
          </div>
<p className="max-w-xl mt-1 text-lg text-slate-600">Join millions of students, researchers and professionals to instanly understand Pdfs</p>

          <div className="w-full mt-4">
            {isAuth ? (
            <FileUpload />) : (
              <Link href="/sign-in">
                <Button>
                  Log in to get started 
                  <LogIn className="w-4 h-4 ml-2"></LogIn>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
