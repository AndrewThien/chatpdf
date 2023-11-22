import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from '@/lib/db';
import { chats, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request, res: Response) {
        const {userId} = await auth();
        if (!userId) {
            return NextResponse.json(
                {error: "Unauthorised"},
                {status: 401}
                );
        }
    
    try {
        const body = await req.json()
        const {file_key, file_name} = body;

        await loadS3IntoPinecone(file_key);
        const existingUser = await db.select().from(users).where(eq(users.user_id, userId));
        const active_user_id = existingUser[0].id;

        const chat_id = await db
        .insert(chats)
        .values({
            user_id: active_user_id,
            file_key: file_key,
            pdf_name: file_name,
            pdf_url: getS3Url(file_key),
        })
        .returning({
            insertedID: chats.id,
        });

        return NextResponse.json(
        {user_id: active_user_id,
         chat_id: chat_id[0].insertedID}, 
        {status: 200}
        );

    } catch (error) {
        console.error(error);  
        return NextResponse.json(
            {error: "internal server error"},
            {status: 500}
        )
    }
}