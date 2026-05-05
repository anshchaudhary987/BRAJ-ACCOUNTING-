'use client';

import { useState, useMemo, memo } from 'react';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, Transition } from '@headlessui/react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLedgers } from '@/hooks/useLedgers';

interface LedgerComboboxProps {
  value: string;
  onChange: (value: string | null) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
  placeholder?: string;
  error?: boolean;
}

const LedgerCombobox = memo(({ 
  value, 
  onChange, 
  onKeyDown,
  className,
  placeholder = "Select Account...",
  error 
}: LedgerComboboxProps) => {
  const [query, setQuery] = useState('');
  const { data: ledgers = [], isLoading } = useLedgers();

  const filteredLedgers = useMemo(() => {
    if (query === '') return ledgers;
    const lowerQuery = query.toLowerCase();
    return ledgers.filter((ledger) => {
      return ledger.name.toLowerCase().includes(lowerQuery) ||
             ledger.groupName.toLowerCase().includes(lowerQuery);
    });
  }, [query, ledgers]);

  const selectedLedger = useMemo(() => {
    return ledgers.find((l) => l.id === value);
  }, [value, ledgers]);

  return (
    <div className="relative w-full">
      <Combobox value={value} onChange={onChange}>
        <div className="relative">
          <div className={cn(
            "relative w-full cursor-default overflow-hidden rounded-xl bg-muted border border-border text-left transition-all focus-within:ring-2 focus-within:ring-violet-500",
            error && "border-red-500/50 focus-within:ring-red-500",
            className
          )}>
            <ComboboxInput
              className="w-full border-none py-3 pl-4 pr-10 text-sm leading-5 text-foreground bg-transparent outline-none font-bold placeholder:text-muted-foreground"
              displayValue={() => selectedLedger?.name || ''}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              autoComplete="off"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              ) : (
                <ChevronsUpDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
              )}
            </div>
          </div>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
            afterLeave={() => setQuery('')}
          >
            <ComboboxOptions className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-card border border-border py-1 text-base shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm backdrop-blur-xl">
              {filteredLedgers.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-4 px-4 text-slate-400 italic">
                  Nothing found.
                </div>
              ) : (
                filteredLedgers.map((ledger) => (
                  <ComboboxOption
                    key={ledger.id}
                    className={({ focus }) =>
                      cn(
                        "relative cursor-default select-none py-3 pl-10 pr-4 transition-colors",
                        focus ? "bg-violet-600 text-white" : "text-foreground"
                      )
                    }
                    value={ledger.id}
                  >
                    {({ selected, focus }) => (
                      <>
                        <div className="flex flex-col">
                          <span className={cn("block truncate font-bold", selected ? "text-foreground" : "")}>
                            {ledger.name}
                          </span>
                          <span className={cn("block truncate text-xs", focus ? "text-violet-200" : "text-muted-foreground")}>
                            {ledger.groupName}
                          </span>
                        </div>
                        {selected ? (
                          <span className={cn("absolute inset-y-0 left-0 flex items-center pl-3", focus ? "text-white" : "text-violet-500")}>
                            <Check className="h-4 w-4" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </ComboboxOption>
                ))
              )}
            </ComboboxOptions>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
});

LedgerCombobox.displayName = 'LedgerCombobox';
export default LedgerCombobox;
