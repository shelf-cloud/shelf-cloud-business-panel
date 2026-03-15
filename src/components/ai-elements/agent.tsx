"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@shadcn/ui/accordion";
import { Badge } from "@shadcn/ui/badge";
import { cn } from "@/lib/shadcn/utils";
import type { Tool } from "ai";
import { BotIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { memo } from "react";

import { CodeBlock } from "./code-block";

export type AgentProps = ComponentProps<"div">;

export const Agent = memo(({ className, ...props }: AgentProps) => (
  <div
    className={cn("tw:not-prose tw:w-full tw:rounded-md tw:border", className)}
    {...props}
  />
));

export type AgentHeaderProps = ComponentProps<"div"> & {
  name: string;
  model?: string;
};

export const AgentHeader = memo(
  ({ className, name, model, ...props }: AgentHeaderProps) => (
    <div
      className={cn(
        "tw:flex tw:w-full tw:items-center tw:justify-between tw:gap-4 tw:p-3",
        className
      )}
      {...props}
    >
      <div className="tw:flex tw:items-center tw:gap-2">
        <BotIcon className="tw:size-4 tw:text-muted-foreground" />
        <span className="tw:font-medium tw:text-sm">{name}</span>
        {model && (
          <Badge className="tw:font-mono tw:text-xs" variant="secondary">
            {model}
          </Badge>
        )}
      </div>
    </div>
  )
);

export type AgentContentProps = ComponentProps<"div">;

export const AgentContent = memo(
  ({ className, ...props }: AgentContentProps) => (
    <div className={cn("tw:space-y-4 tw:p-4 tw:pt-0", className)} {...props} />
  )
);

export type AgentInstructionsProps = ComponentProps<"div"> & {
  children: string;
};

export const AgentInstructions = memo(
  ({ className, children, ...props }: AgentInstructionsProps) => (
    <div className={cn("tw:space-y-2", className)} {...props}>
      <span className="tw:font-medium tw:text-muted-foreground tw:text-sm">
        Instructions
      </span>
      <div className="tw:rounded-md tw:bg-muted/50 tw:p-3 tw:text-muted-foreground tw:text-sm">
        <p>{children}</p>
      </div>
    </div>
  )
);

export type AgentToolsProps = ComponentProps<typeof Accordion>;

export const AgentTools = memo(({ className, ...props }: AgentToolsProps) => (
  <div className={cn("tw:space-y-2", className)}>
    <span className="tw:font-medium tw:text-muted-foreground tw:text-sm">Tools</span>
    <Accordion className="tw:rounded-md tw:border" {...props} />
  </div>
));

export type AgentToolProps = ComponentProps<typeof AccordionItem> & {
  tool: Tool;
};

export const AgentTool = memo(
  ({ className, tool, value, ...props }: AgentToolProps) => {
    const schema =
      "jsonSchema" in tool && tool.jsonSchema
        ? tool.jsonSchema
        : tool.inputSchema;

    return (
      <AccordionItem
        className={cn("tw:border-b tw:last:border-b-0", className)}
        value={value}
        {...props}
      >
        <AccordionTrigger className="tw:px-3 tw:py-2 tw:text-sm tw:hover:no-underline">
          {tool.description ?? "No description"}
        </AccordionTrigger>
        <AccordionContent className="tw:px-3 tw:pb-3">
          <div className="tw:rounded-md tw:bg-muted/50">
            <CodeBlock code={JSON.stringify(schema, null, 2)} language="json" />
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }
);

export type AgentOutputProps = ComponentProps<"div"> & {
  schema: string;
};

export const AgentOutput = memo(
  ({ className, schema, ...props }: AgentOutputProps) => (
    <div className={cn("tw:space-y-2", className)} {...props}>
      <span className="tw:font-medium tw:text-muted-foreground tw:text-sm">
        Output Schema
      </span>
      <div className="tw:rounded-md tw:bg-muted/50">
        <CodeBlock code={schema} language="typescript" />
      </div>
    </div>
  )
);

Agent.displayName = "Agent";
AgentHeader.displayName = "AgentHeader";
AgentContent.displayName = "AgentContent";
AgentInstructions.displayName = "AgentInstructions";
AgentTools.displayName = "AgentTools";
AgentTool.displayName = "AgentTool";
AgentOutput.displayName = "AgentOutput";
