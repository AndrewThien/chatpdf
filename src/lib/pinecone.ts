import { PineconeClient, Vector, utils as PineconeUtils } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import {PDFLoader} from "langchain/document_loaders/fs/pdf"
import { S3Loader } from "langchain/document_loaders/web/s3";
import {Document, RecursiveCharacterTextSplitter} from '@pinecone-database/doc-splitter'
import { getEmbeddings } from "./embeddings";
import md5 from 'md5'
import { convertToAscii } from "./utils";
import { getS3Url } from "./s3";
import path from "path";

let pinecone: PineconeClient | null = null;

export const getPineconeClient = async () => {
    if (!pinecone) {
      pinecone = new PineconeClient();
      await pinecone.init({
        environment: process.env.PINECONE_ENVIRONMENT!,
        apiKey: process.env.PINECONE_API_KEY!,
         });
    }
return pinecone;
};

type PDFPage = {
    pageContent: string;
    metadata: {
        loc: {pageNumber: number};
    }
}

export async function loadS3IntoPinecone(file_key: string) {
    // 1. obtain the pdf - download and read from pdf
    console.log("Downloading S3 into file system")
    console.log(file_key)
    const loader = new S3Loader({
        bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        key: file_key,
        s3Config: {
            region: "eu-west-2",
            credentials: {
              accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
              secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
          },
        },
        unstructuredAPIURL: "http://localhost:3000/api/create-chat",
        unstructuredAPIKey: "", // this will be soon required
      });

    const pages = (await loader.load()) as PDFPage[];

    // 2. Split and segment the pdf
    const documents = await Promise.all(pages.map(prepareDocument));


    // 3. vectorise and embed individual docs
     const vectors = await Promise.all(documents.flat().map(embedDocument));

     // 4. Upload to pincecone
     const client = await getPineconeClient();
     const pineconeIndex = await client.Index('chatpdf');

     console.log('inserting vectors into pinecone')
     const namespace = convertToAscii(file_key);

     PineconeUtils.chunkedUpsert(pineconeIndex, vectors, namespace, 10)

     return documents[0]


}

async function embedDocument(doc: Document) {
    try {
        const embeddings = await getEmbeddings(doc.pageContent)
        const hash = md5(doc.pageContent)

    return {
        id: hash,
        values: embeddings,
        metadata: {
            text: doc.metadata.text,
            pageNumber: doc.metadata.pageNumber
        }
    } as Vector

    } catch (error) {
        console.log('Error embedding document', error)
        throw error
    }
}

export const truncateStringByBytes = (str: string, bytes: number)=> {
    const enc = new TextEncoder()
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0,bytes))
}

async function prepareDocument(page: PDFPage) {
    let {pageContent, metadata} = page
    pageContent = pageContent.replace(/\n/g, '')
    // split the docs
    const splitter = new RecursiveCharacterTextSplitter()
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncateStringByBytes(pageContent, 36000)
            }
        })
    ])
    return docs
}
