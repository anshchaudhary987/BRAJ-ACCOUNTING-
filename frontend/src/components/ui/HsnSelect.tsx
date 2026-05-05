'use client';

import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, Transition } from '@headlessui/react';
import { Check, ChevronsUpDown, Loader2, Hash, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { HSN, ApiResponse } from '@/types';

interface HsnSelectProps {
  value: string;
  onChange: (value: string | null) => void;
  className?: string;
  placeholder?: string;
}

const HsnSelect = memo(({ 
  value, 
  onChange, 
  className,
  placeholder = "Select HSN/SAC Code..."
}: HsnSelectProps) => {
  const [query, setQuery] = useState('');

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ['hsn-codes'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<HSN[]>>('/master/hsn');
      return res.data.data;
    }
  });

  const filteredCodes = useMemo(() => {
    if (query === '') return codes;
    const lowerQuery = query.toLowerCase();
    return codes.filter((c) => {
      return c.code.toLowerCase().includes(lowerQuery) ||
             c.description.toLowerCase().includes(lowerQuery);
    });
  }, [query, codes]);

  const selectedCode = useMemo(() => {
    return codes.find((c) => c.id === value);
  }, [value, codes]);

  return (
    <div className="relative w-full">
      <Combobox value={value} onChange={onChange}>
        <div className="relative">
          <div className={cn(
            "relative w-full cursor-default overflow-hidden rounded-3xl bg-white/5 border border-white/5 text-left transition-all focus-within:bg-white/10 focus-within:border-white/20",
            className
          )}>
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-white/20">
              <Hash size={18} />
            </div>
            <ComboboxInput
              className="w-full border-none py-5 pl-16 pr-10 outline-none bg-transparent text-white font-bold placeholder:text-white/10"
              displayValue={() => selectedCode ? `${selectedCode.code}` : ''}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              autoComplete="off"
            />
            <div className="absolute inset-y-0 right-6 flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white/20" />
              ) : (
                <ChevronsUpDown className="h-4 w-4 text-white/20" aria-hidden="true" />
              )}
            </div>
          </div>
          
          <Transition
            afterLeave={() => setQuery('')}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <ComboboxOptions className="absolute z-[100] mt-4 max-h-80 w-full overflow-auto rounded-[2rem] bg-black border border-white/10 py-2 shadow-[0_0_50px_rgba(0,0,0,1)] backdrop-blur-3xl">
              {filteredCodes.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-4 px-6 text-white/20 italic text-sm">
                  Nothing found in HSN registry.
                </div>
              ) : (
                filteredCodes.map((c) => (
                  <ComboboxOption
                    key={c.id}
                    className={({ focus }) =>
                      cn(
                        "relative cursor-default select-none py-4 px-6 transition-all",
                        focus ? "bg-white/10 text-white" : "text-white/60"
                      )
                    }
                    value={c.id}
                  >
                    {({ selected, focus }) => (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col">
                          <span className={cn("font-black tracking-widest uppercase text-sm", selected ? "text-white" : "text-white/80")}>
                            {c.code}
                          </span>
                          <span className={cn("text-[10px] font-medium leading-relaxed mt-1", focus ? "text-white/60" : "text-white/20")}>
                            {c.description}
                          </span>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-[10px] font-black bg-white/5 px-2 py-1 rounded-md text-white/40 uppercase tracking-tighter">
                            GST {c.gstRate}%
                          </span>
                          {selected && <Check className="h-4 w-4 text-white mt-2" />}
                        </div>
                      </div>
                    )}
                  </ComboboxOption>
                ))
              )}
            </ComboboxOptions>
          </Transition>
        </div>
      </Combobox>
      
      {selectedCode && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5"
        >
          <Info size={14} className="text-white/20 mt-0.5 shrink-0" />
          <p className="text-[10px] text-white/40 font-medium leading-tight">
            <span className="text-white/60 font-bold">Registry Info:</span> {selectedCode.description}
          </p>
        </motion.div>
      )}
    </div>
  );
});

HsnSelect.displayName = 'HsnSelect';
export default HsnSelect;
