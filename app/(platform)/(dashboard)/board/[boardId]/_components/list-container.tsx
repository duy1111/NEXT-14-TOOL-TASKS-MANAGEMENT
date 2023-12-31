"use client";

import { ListWithCards } from "@/types";
import { List } from "@prisma/client";
import { ListForm } from "./list-form";
import { useEffect, useState } from "react";
import { ListItem } from "./list-item";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useAction } from "@/hooks/use-action";
import { updateListOrder } from "@/actions/update-list-order";
import { toast } from "sonner";
import { updateCardOrder } from "@/actions/update-card-order";
interface ListContainerProps {
  data: ListWithCards[];
  boardId: string;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export const ListContainer = ({ data, boardId }: ListContainerProps) => {
  const [orderedData, setOrderedData] = useState(data);
  const {execute: executeUpdateListOrder} = useAction(updateListOrder,{
    onSuccess: (data) => {
      toast.success("List reorder")
    },
    onError: (error) => {
      toast.error("Failed to update reorder")
    }
  })

  const {execute: executeUpdateCardOrder} = useAction(updateCardOrder, {
    onSuccess:(data) => {
      toast.success("Card reorder")
    },
    onError: (error) => {
      toast.error("Failed to update reorder")
    }
  })

  useEffect(() => {
    setOrderedData(data);
  }, [data]);

  const onDragEnd = (result: any) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    //if dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if(type === "list"){
        const items = reorder(
          orderedData,
          source.index,
          destination.index
        ).map((item, index) => ({
          ...item,
          order: index
        }))

        setOrderedData(items)
        executeUpdateListOrder({items, boardId})
    }

    if(type === "card"){
      let newOrderedData = [...orderedData];

      const sourceList = newOrderedData.find(list => list.id === source.droppableId);
      const destList = newOrderedData.find(list => list.id === destination.droppableId);

      if(!sourceList || !destList){
        return;
      }

      if(!sourceList.cards){
        sourceList.cards = [];
      }

      //Check if cards exists on the destList

      if(!destList.cards){
        destList.cards = []
      }

      // moving the card in the same list

      if(source.droppableId === destination.droppableId){
        const reorderedCards = reorder(
          sourceList.cards,
          source.index,
          destination.index
        );

        reorderedCards.forEach((card, index) => {
          card.order = index
        });

        sourceList.cards = reorderedCards;

        setOrderedData(newOrderedData)
        // TOD0:Trigger server action
        //User moves the card to another list

        executeUpdateCardOrder({
          items: reorderedCards,
          boardId,
        })

      }else{
        //remove card from the source list
        const [movedCard] = sourceList.cards.splice(source.index, 1);

        //Assign the new listId  to the moved card
        movedCard.listId = destination.droppableId;

        //Add card to the destination list
        destList.cards.splice(destination.index, 0, movedCard);

        sourceList.cards.forEach((card, index) => {
          card.order = index
        })

        //Update the order for each card in the destination list
        destList.cards.forEach((card, index) => {
          card.order = index
        })

        setOrderedData(newOrderedData)
        //To do: Trigger server action
        executeUpdateCardOrder({
          items: destList.cards,
          boardId

        })
      }
    }


  };

  return (
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="lists" type="list" direction="horizontal">
        {(provider) => (
          <ol
            {...provider.droppableProps}
            ref={provider.innerRef}
            className="flex gap-x-3 h-full"
          >
            {orderedData.map((list, index) => {
              return <ListItem key={list?.id} index={index} data={list} />;
            })}
            {provider.placeholder}
            <ListForm />
            <div className=" flex-shrink-0 w-1" />
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};
