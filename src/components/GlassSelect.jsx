import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';

// Custom dropdown that replaces the browser's raw <select> menu.
// Keyboard: Enter/Space/ArrowDown opens; Arrow keys, Home, End move; Enter/Space picks;
// Esc closes and returns focus to the trigger; typing a letter jumps to a match.
const GlassSelect = ({ label, value, onChange, options, format = (x) => x }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const typeahead = useRef({ text: '', timer: 0 });
  const id = useId();

  const items = [{ value: '', text: 'Any' }, ...options.map((o) => ({ value: o, text: format(o) }))];
  const selectedIndex = Math.max(0, items.findIndex((i) => i.value === value));

  const openList = () => {
    setActive(selectedIndex);
    setOpen(true);
  };
  const closeList = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };
  const choose = (i) => {
    onChange(items[i].value);
    closeList();
  };

  // Click outside closes. Opening another dropdown is an outside click, so only one stays open.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // Move focus into the list and keep the active row in view
  useEffect(() => {
    if (open) listRef.current?.focus({ preventScroll: true });
  }, [open]);
  useEffect(() => {
    if (!open) return;
    document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, id]);

  const onTriggerKey = (e) => {
    if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      openList();
    }
  };

  const onListKey = (e) => {
    const last = items.length - 1;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(last, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(last);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(active);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      closeList();
    } else if (e.key === 'Tab') {
      closeList(false);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      const t = typeahead.current;
      clearTimeout(t.timer);
      t.text += e.key.toLowerCase();
      t.timer = setTimeout(() => (t.text = ''), 600);
      const hit = items.findIndex((i) => i.text.toLowerCase().startsWith(t.text));
      if (hit >= 0) setActive(hit);
    }
  };

  const current = items[selectedIndex];

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? closeList(false) : openList())}
        onKeyDown={onTriggerKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        className={`inline-flex h-10 items-center gap-2 rounded-full pl-4 pr-3 text-sm transition ${
          value ? 'glass-active' : 'liquid hover:brightness-125'
        }`}
      >
        <span className="text-xs font-medium text-white/60 [text-shadow:none]">{label}</span>
        <span className="font-semibold text-white">{current.text}</span>
        <ChevronDown className={`h-4 w-4 text-white/60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={`${id}-${active}`}
            onKeyDown={onListKey}
            style={{ transformOrigin: 'top left' }}
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
            className="glass-strong absolute left-0 top-full z-40 mt-2 max-h-72 w-max min-w-full max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl p-1.5 outline-none [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.3)_transparent]"
          >
            {items.map((item, i) => {
              const selected = i === selectedIndex;
              return (
                <li
                  key={item.value || 'any'}
                  id={`${id}-${i}`}
                  role="option"
                  aria-selected={selected}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => choose(i)}
                  className={`flex cursor-pointer items-center justify-between gap-6 rounded-xl px-3 py-2 text-sm transition-colors ${
                    i === active ? 'bg-white/15' : ''
                  } ${selected ? 'font-semibold text-white' : 'text-gray-200'}`}
                >
                  {item.text}
                  {selected && <Check className="h-4 w-4 text-pink-400" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlassSelect;
