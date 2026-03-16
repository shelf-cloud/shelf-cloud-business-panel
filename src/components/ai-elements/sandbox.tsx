"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@shadcn/ui/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@shadcn/ui/tabs";
import { cn } from "@/lib/shadcn/utils";
import type { ToolUIPart } from "ai";
import { ChevronDownIcon, Code } from "lucide-react";
import type { ComponentProps } from "react";

import { getStatusBadge } from "./tool";

export type SandboxRootProps = ComponentProps<typeof Collapsible>;

export const Sandbox = ({ className, ...props }: SandboxRootProps) => (
  <Collapsible
    className={cn(
      "tw:not-prose tw:group tw:mb-4 tw:w-full tw:overflow-hidden tw:rounded-md tw:border",
      className
    )}
    defaultOpen
    {...props}
  />
);

export interface SandboxHeaderProps {
  title?: string;
  state: ToolUIPart["state"];
  className?: string;
}

export const SandboxHeader = ({
  className,
  title,
  state,
  ...props
}: SandboxHeaderProps) => (
  <CollapsibleTrigger
    className={cn(
      "tw:flex tw:w-full tw:items-center tw:justify-between tw:gap-4 tw:p-3",
      className
    )}
    {...props}
  >
    <div className="tw:flex tw:items-center tw:gap-2">
      <Code className="tw:size-4 tw:text-muted-foreground" />
      <span className="tw:font-medium tw:text-sm">{title}</span>
      {getStatusBadge(state)}
    </div>
    <ChevronDownIcon className="tw:size-4 tw:text-muted-foreground tw:transition-transform tw:group-data-[state=open]:rotate-180" />
  </CollapsibleTrigger>
);

export type SandboxContentProps = ComponentProps<typeof CollapsibleContent>;

export const SandboxContent = ({
  className,
  ...props
}: SandboxContentProps) => (
  <CollapsibleContent
    className={cn(
      "tw:data-[state=closed]:fade-out-0 tw:data-[state=closed]:slide-out-to-top-2 tw:data-[state=open]:slide-in-from-top-2 tw:outline-none tw:data-[state=closed]:animate-out tw:data-[state=open]:animate-in",
      className
    )}
    {...props}
  />
);

export type SandboxTabsProps = ComponentProps<typeof Tabs>;

export const SandboxTabs = ({ className, ...props }: SandboxTabsProps) => (
  <Tabs className={cn("tw:w-full tw:gap-0", className)} {...props} />
);

export type SandboxTabsBarProps = ComponentProps<"div">;

export const SandboxTabsBar = ({
  className,
  ...props
}: SandboxTabsBarProps) => (
  <div
    className={cn(
      "tw:flex tw:w-full tw:items-center tw:border-border tw:border-t tw:border-b",
      className
    )}
    {...props}
  />
);

export type SandboxTabsListProps = ComponentProps<typeof TabsList>;

export const SandboxTabsList = ({
  className,
  ...props
}: SandboxTabsListProps) => (
  <TabsList
    className={cn("tw:h-auto tw:rounded-none tw:border-0 tw:bg-transparent tw:p-0", className)}
    {...props}
  />
);

export type SandboxTabsTriggerProps = ComponentProps<typeof TabsTrigger>;

export const SandboxTabsTrigger = ({
  className,
  ...props
}: SandboxTabsTriggerProps) => (
  <TabsTrigger
    className={cn(
      "tw:rounded-none tw:border-0 tw:border-transparent tw:border-b-2 tw:px-4 tw:py-2 tw:font-medium tw:text-muted-foreground tw:text-sm tw:transition-colors tw:data-[state=active]:border-primary tw:data-[state=active]:bg-transparent tw:data-[state=active]:text-foreground tw:data-[state=active]:shadow-none",
      className
    )}
    {...props}
  />
);

export type SandboxTabContentProps = ComponentProps<typeof TabsContent>;

export const SandboxTabContent = ({
  className,
  ...props
}: SandboxTabContentProps) => (
  <TabsContent className={cn("tw:mt-0 tw:text-sm", className)} {...props} />
);
