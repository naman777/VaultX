"use server"

import prisma from "@/lib/db"


const getFiles = async (email:string) => {
    try {
        
        const files = await prisma.user.findUnique({
            where:{
                email
            },
            select:{
                files:true
            }
        })

        return {
            success:true,
            files:files?.files
        }

    } catch (error) {
        
        return {
            success:false,
            message:"Failed to fetch files"
        }
    }

}

export {getFiles}