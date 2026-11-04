"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({selected,onSelect,disabled}) {
    return (
        <Popover>
            <PopoverTrigger render={
                <Button
                    variant={"outline"}
                    data-empty={!selected}
                    className="w-53
                    justify-between
                    text-left
                    font-normal
                    data-[empty=true]:text-muted-foreground"
                >
                    {selected ? selected.toLocaleDateString() : <span>Seleccione una fecha</span>}<ChevronDownIcon data-icon="inline-end" />
                </Button>} 
            />
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                mode="single"
                selected={selected}
                onSelect={onSelect}
                disabled={disabled}
                />
            </PopoverContent>
        </Popover>
    )
}
