'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { State, ApiResponse } from '@/types';
import { Check, ChevronsUpDown, Loader2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface StateSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function StateSelect({ value, onChange, className }: StateSelectProps) {
  const [open, setOpen] = useState(false);

  const { data: states = [], isLoading } = useQuery({
    queryKey: ['states'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<State[]>>('/master/states');
      return res.data.data;
    }
  });

  const selectedState = states.find((state) => state.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center justify-between bg-white/5 border border-white/5 rounded-3xl px-8 py-5 focus:bg-white/10 outline-none transition-all text-white font-semibold text-left",
            className
          )}
        >
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-white/20" />
            <span>{selectedState ? `${selectedState.name} (${selectedState.code})` : "Select Jurisdiction State..."}</span>
          </div>
          {isLoading ? <Loader2 className="animate-spin text-white/20" size={18} /> : <ChevronsUpDown className="text-white/20" size={18} />}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[300px] p-0 bg-black border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl">
        <Command className="bg-transparent">
          <CommandInput placeholder="Search Indian States/UTs..." className="border-none focus:ring-0 text-white" />
          <CommandList>
            <CommandEmpty className="p-4 text-sm text-white/20 italic">No jurisdiction found.</CommandEmpty>
            <CommandGroup>
              {states.map((state) => (
                <CommandItem
                  key={state.id}
                  value={state.name}
                  onSelect={() => {
                    onChange(state.id);
                    setOpen(false);
                  }}
                  className="px-6 py-4 aria-selected:bg-white/10 aria-selected:text-white text-white/60 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-bold">{state.name}</span>
                    <span className="text-[10px] uppercase tracking-widest text-white/20 font-black">GST Code: {state.code}</span>
                  </div>
                  {value === state.id && <Check className="text-white" size={18} />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
