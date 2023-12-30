"use server";

import { auth } from "@clerk/nextjs";
import { InputType, ReturnType } from "./types";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateCard } from "./schema";
import { db } from "@/lib/db";

const handler = async (data: InputType): Promise<ReturnType> => {
    const {userId, orgId} = auth();

    if(!userId || !orgId) {
        return {
            error: "Unauthorized"
        }
    }

    const {title, boardId, listId} = data;
    let card;
    try{

        const list = await db.list.findUnique({
            where:{
                id: listId,
                board: {
                    orgId
                }
            }
        })

        if(!list){
            return {
                error: "list not found"
            }
        }

        const lastCard = await db.card.findFirst({
            where: {
                listId
            },
            orderBy:{
                order:"desc"
            },
            select:{
                order:true
            }
        })

        const newOrder = lastCard ? lastCard.order + 1 : 1;

        card = await db.card.create({
            data:{
                title,
                listId,
                order:newOrder
            }
        });

        revalidatePath(`/board/${boardId}`)
        return { data: card }
    }catch(error){
        return {
            error: "Failed to create"
        }
    }
    revalidatePath(`/board/${boardId}`);
    return {
        data: list
    }
}

export const createCard = createSafeAction(CreateCard, handler)