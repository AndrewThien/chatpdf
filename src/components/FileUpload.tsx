"use client"

import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React from "react";
import {useDropzone} from "react-dropzone"
import axios from "axios"
import toast from "react-hot-toast";
import  {useRouter} from 'next/navigation'


const FileUpload = () => {
    const router = useRouter();
    const [uploading, setUpLoading] = React.useState(false);
    const {mutate, isLoading} = useMutation({
        mutationFn: async ({file_key, file_name}: {file_key:string, file_name:string}) => {
            const response = await axios.post("/api/create-chat", {
                file_key,
                file_name
            });
            return response.data
        }
})

    const {getRootProps, getInputProps} = useDropzone({
        accept: {"application/pdf": [".pdf"]},
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            const file= acceptedFiles[0]

            if (file.size > 10*1024*1024) {
                toast.error("File too large"); 
          
                return
            }
            try {
                setUpLoading(true)
                const data = await uploadToS3(file);
                if (!data?.file_key || !data.file_name) {
                    toast.error("something went wrong")
                    return;
                }
            
            mutate(data, {
                onSuccess: ({chat_id}) => { 
                    toast.success("chat created!");
                    router.push(`/chat/${chat_id}`);
                },
                onError: (err) => {
                    toast.error("Error creating chats");
                    console.error(err)
                }
            })

                console.log("data", data)
            } catch (error) {
                console.log(error)
            } finally {
                setUpLoading(false)
            }
            
        },
     });
        
    return (
        <div className="p-2 bg-white rounded-xl">
            <div {...getRootProps({
                className: "border-dashed border-2 rounded-x1 cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
            })}>
                <input {...getInputProps()}/>
                {uploading || isLoading ? (
                    <>
                    {/*loaing state*/}
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin"/>
                    <p className="mt-2 text-sm text-slate-400">
                        Spilling Tea to GPT ...
                    </p>
                    </>
                ) : (
                    <>
                <Inbox className="w-10 10-10 text-blue-500"/>
                <p className="mt-2 text-sm text-slate-400"> Drop your pdf here</p>
                </>
                )}
                
                </div>
            </div>
    )
}

export default FileUpload 