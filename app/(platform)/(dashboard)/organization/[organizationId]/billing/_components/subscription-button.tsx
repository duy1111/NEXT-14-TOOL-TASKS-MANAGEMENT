"use client";

import { stripeRedirect } from "@/actions/stripe-redirect";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import { useProModal } from "@/hooks/use-pro-modal";
import { useCallback } from "react";
import { toast } from "sonner";

interface SubscriptionButtonProps {
    isPro: boolean
}

export const SubscriptionButton = ({
    isPro
}:SubscriptionButtonProps) => {
    const proModal = useProModal()


    const {execute, isLoading} = useAction(stripeRedirect, {
        onSuccess: (data) => {
            window.location.href = data;
        },
        onError: (error) => {
            toast.error(error)
        }
    })

    const onClick = useCallback(() => {
        if(isPro){
            execute({})
        }else{
            proModal.onOpen()
        }

    },[proModal,isPro,execute])

    return(
        <Button
            variant={"primary"}
            disabled={isLoading}
            onClick={onClick}
        >
            {isPro ? "Manage subscription": "Upgrade to pro"}
        </Button>
    )
}