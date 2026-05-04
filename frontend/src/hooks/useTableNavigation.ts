'use client';

import { useCallback, KeyboardEvent } from 'react';

interface UseTableNavigationProps {
  rowCount: number;
  colCount: number;
  onAddRow?: () => void;
}

export function useTableNavigation({ rowCount, colCount, onAddRow }: UseTableNavigationProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent, row: number, col: number) => {
    const { key, ctrlKey, altKey, shiftKey } = e;

    // Handle Enter for sequential navigation
    if (key === 'Enter' && !ctrlKey && !altKey && !shiftKey) {
      e.preventDefault();
      if (col < colCount - 1) {
        // Move to next column in same row
        focusCell(row, col + 1);
      } else if (row < rowCount - 1) {
        // Move to first column of next row
        focusCell(row + 1, 0);
      } else if (onAddRow) {
        // Add new row and focus it (will need a small delay for DOM to update)
        onAddRow();
        setTimeout(() => focusCell(row + 1, 0), 50);
      }
      return;
    }

    // Handle Arrow Keys
    if (key === 'ArrowDown') {
      e.preventDefault();
      if (row < rowCount - 1) {
        focusCell(row + 1, col);
      }
    } else if (key === 'ArrowUp') {
      e.preventDefault();
      if (row > 0) {
        focusCell(row - 1, col);
      }
    } else if (key === 'ArrowRight' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'SELECT') {
      // Only move right if not in an input (to avoid breaking cursor movement)
      if (col < colCount - 1) {
        focusCell(row, col + 1);
      }
    } else if (key === 'ArrowLeft' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'SELECT') {
      if (col > 0) {
        focusCell(row, col - 1);
      }
    }
  }, [rowCount, colCount, onAddRow]);

  const focusCell = (row: number, col: number) => {
    const element = document.querySelector(`[data-nav-row="${row}"][data-nav-col="${col}"]`) as HTMLElement;
    if (element) {
      // Find the actual input or button inside the cell container if it's not the target
      const input = element.querySelector('input, select, button') as HTMLElement;
      if (input) {
        input.focus();
      } else {
        element.focus();
      }
    }
  };

  return { handleKeyDown };
}
