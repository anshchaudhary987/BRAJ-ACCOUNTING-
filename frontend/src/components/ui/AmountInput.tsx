'use client';

import { NumericFormat, NumericFormatProps } from 'react-number-format';
import { cn } from '@/lib/utils';

interface AmountInputProps extends Omit<NumericFormatProps, 'onChange'> {
  value: number;
  onAmountChange: (value: number) => void;
  className?: string;
  error?: boolean;
}

export default function AmountInput({ 
  value, 
  onAmountChange, 
  className,
  ...props 
}: AmountInputProps) {
  return (
    <NumericFormat
      value={value === 0 ? '' : value}
      onValueChange={(values) => {
        onAmountChange(values.floatValue || 0);
      }}
      thousandSeparator=","
      thousandsGroupStyle="lakh"
      decimalScale={2}
      fixedDecimalScale
      prefix="₹ "
      placeholder="₹ 0.00"
      className={cn(
        "w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 font-mono font-bold text-right transition-all text-foreground",
        className
      )}
      {...props}
    />
  );
}
