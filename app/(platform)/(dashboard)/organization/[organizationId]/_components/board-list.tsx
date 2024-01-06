"use server"

import { FormPopover } from "@/components/forms/form-popover";
import { Hint } from "@/components/hint";
import { HelpCircle, User2 } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { MAX_FREE_BOARDS } from "@/constants/board";
import { getAvailableCount } from "@/lib/org-limit";
import { checkSubscription } from "@/lib/subscription";
export const BoardList = async() => {

    const {orgId} = auth();

    if(!orgId){
        return redirect("/select-org")
    }

    const boards = await db.board.findMany({
        where:{
            orgId
        },
        orderBy:{
            createdAt:"desc"
        }
    });

    const availableCount = await getAvailableCount()
    const isPro = await checkSubscription();



    return (
        <div className="space-y-4" >
            <div className=" flex items-center font-semibold text-lg text-neutral-700" >
                <User2 className=" h-6 w-6 mr-2" />
                Your boards
            </div>
            <div className=" grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" >
                {boards.map((board) => (
                    <Link
                        href={`/board/${board.id}`}
                        key={board.id}
                        className=" group relative overflow-hidden aspect-video bg-no-repeat bg-center bg-cover bg-sky-700 rounded-sm h-full w-full p-2"
                        style={{ backgroundImage: `url(${board.imageThumbUrl})` }}
                    >
                        <div
                            className=" absolute inset-0 bg-black/30 group-hover:bg-black/40 transition"
                        />
                        <p className=" relative font-semibold text-white" >
                            {board.title}
                        </p>
                    </Link>
                ))}
                <FormPopover sideOffSet={10} side="right" >
                    <div
                        role="button"
                        className="aspect-video relative h-full w-full bg-muted rounded-sm flex flex-col gap-y-1 items-center justify-center hover:opacity-75 transition"
                    >
                        <p className=" text-sm" >Create new board</p>
                        <span className=" text-xs" >
                            {isPro ? "Unlimited" : `${MAX_FREE_BOARDS - availableCount} remaining`}
                        </span>
                        <Hint
                            sideOffSet={40}
                            description={`
                                Free Workspaces can have up to open boards. For unlimited boards upgrade this workspaces.
                            `}
                        >
                            <HelpCircle
                                className=" bottom-2 absolute right-2 h-[14px] w-[14px]"
                            />
                        </Hint>
                    </div>
                </FormPopover>
            </div>
        </div>
    );
};

BoardList.Skeleton = function SkeletonBoardList() {
    return (
        <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
            <Skeleton className=" p-2 aspect-video h-full w-full" />
            <Skeleton className=" p-2 aspect-video h-full w-full" />
            <Skeleton className=" p-2 aspect-video h-full w-full" />
            <Skeleton className=" p-2 aspect-video h-full w-full" />
            <Skeleton className=" p-2 aspect-video h-full w-full" />
            <Skeleton className=" p-2 aspect-video h-full w-full" />
            <Skeleton className=" p-2 aspect-video h-full w-full" />
            <Skeleton className=" p-2 aspect-video h-full w-full" />
        </div>
    )
}