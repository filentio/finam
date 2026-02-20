"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TagInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = React.useState("");

  function addTag(raw: string) {
    const t = raw.trim();
    if (!t) return;
    if (value.includes(t)) return;
    onChange([...value, t]);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const parts = draft.split(",").map((x) => x.trim()).filter(Boolean);
      parts.forEach(addTag);
      setDraft("");
    }
    if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {value.map((t) => (
          <Badge key={t} variant="secondary" className="gap-1">
            {t}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4"
              onClick={() => onChange(value.filter((x) => x !== t))}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder || "Введите и нажмите Enter"}
      />
      <div className="text-xs text-muted-foreground">Подсказка: можно вставлять через запятую.</div>
    </div>
  );
}

