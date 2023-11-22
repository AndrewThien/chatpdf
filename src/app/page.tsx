import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs";
import Link from 'next/link'
import { ArrowRight, LogIn } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { checkSubscription } from "@/lib/subscription";
import SubscriptionButton from "@/components/SubscriptionButton";
import { chats } from "@/lib/db/schema";
import { users } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export default async function Home() {
  const {userId} = await auth()
  const user = await currentUser();
  const isAuth = !!userId;
  const isPro = await checkSubscription();
  let firstChat;
  let active_user_id;
  if (userId) {
        // Check if userId already exists in the users table
    const existingUser = await db.select().from(users).where(eq(users.user_id, userId));
    
    if (!existingUser || existingUser.length === 0) {
      // Insert a new entry if the user does not exist in the users table
      const userInsertResult = await db
        .insert(users)
        .values({
          user_id: userId,
          user_name: user?.firstName
        })
        .returning({
          insertedID: users.id,
        });

      active_user_id = userInsertResult[0].insertedID;
    } else {
      // Use the existing user_id if the user already exists in the users table
      active_user_id = existingUser[0].id;
    }


    firstChat = await db.select().from(chats).where(eq(chats.user_id, active_user_id));
    if (firstChat) {
      firstChat = firstChat[0];
    }
  }
  const hasPastChats = !!firstChat;

  return (

    <div className="w-screen min-h-screen bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            { isAuth ? (<h1 className="mr-3 text-4xl font-semibold">Hi {user?.firstName}, let's chat with any pdf</h1> ) :
            (<h1 className="mr-3 text-5xl font-semibold">Chat with any Pdf</h1>)}
            
            <UserButton afterSignOutUrl="/"></UserButton>
          </div>

          <div className="flex mt-2">
           {isAuth && hasPastChats && firstChat &&
           <Link href={`/chat/${active_user_id}/${firstChat?.id}`}><Button>Go to chats <ArrowRight className="ml-2" /></Button></Link>  } 
            <div className="ml-3">
                  <SubscriptionButton isPro={isPro} />
            </div>
          </div>

          <div className="max-w-xl mt-1 text-lg text-slate-600">
              <p>Join millions of students, researchers and professionals to instanly understand Pdfs</p>
          </div>

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
