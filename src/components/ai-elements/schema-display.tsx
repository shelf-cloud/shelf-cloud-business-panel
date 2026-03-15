'use client'

import type { ComponentProps, HTMLAttributes } from 'react'
import { createContext, useContext, useMemo } from 'react'

import { Badge } from '@shadcn/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@shadcn/ui/collapsible'
import { ChevronRightIcon } from 'lucide-react'

import { cn } from '@/lib/shadcn/utils'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface SchemaParameter {
  name: string
  type: string
  required?: boolean
  description?: string
  location?: 'path' | 'query' | 'header'
}

interface SchemaProperty {
  name: string
  type: string
  required?: boolean
  description?: string
  properties?: SchemaProperty[]
  items?: SchemaProperty
}

interface SchemaDisplayContextType {
  method: HttpMethod
  path: string
  description?: string
  parameters?: SchemaParameter[]
  requestBody?: SchemaProperty[]
  responseBody?: SchemaProperty[]
}

const SchemaDisplayContext = createContext<SchemaDisplayContextType>({
  method: 'GET',
  path: '',
})

const methodStyles: Record<HttpMethod, string> = {
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  GET: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PATCH: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PUT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

export type SchemaDisplayHeaderProps = HTMLAttributes<HTMLDivElement>

export const SchemaDisplayHeader = ({ className, children, ...props }: SchemaDisplayHeaderProps) => (
  <div className={cn('tw:flex tw:items-center tw:gap-3 tw:border-b tw:px-4 tw:py-3', className)} {...props}>
    {children}
  </div>
)

export type SchemaDisplayMethodProps = ComponentProps<typeof Badge>

export const SchemaDisplayMethod = ({ className, children, ...props }: SchemaDisplayMethodProps) => {
  const { method } = useContext(SchemaDisplayContext)

  return (
    <Badge className={cn('tw:font-mono tw:text-xs', methodStyles[method], className)} variant='secondary' {...props}>
      {children ?? method}
    </Badge>
  )
}

export type SchemaDisplayPathProps = HTMLAttributes<HTMLSpanElement>

export const SchemaDisplayPath = ({ className, children, ...props }: SchemaDisplayPathProps) => {
  const { path } = useContext(SchemaDisplayContext)

  // Highlight path parameters
  const highlightedPath = path.replaceAll(/\{([^}]+)\}/g, '<span class="text-blue-600 dark:text-blue-400">{$1}</span>')

  if (typeof children !== 'undefined' && typeof children !== 'string') {
    return (
      <span className={cn('tw:font-mono tw:text-sm', className)} {...props}>
        {children}
      </span>
    )
  }

  return (
    <span
      className={cn('tw:font-mono tw:text-sm', className)}
      // oxlint-disable-next-line eslint-plugin-react(no-danger)
      dangerouslySetInnerHTML={{ __html: children ?? highlightedPath }}
      {...props}
    />
  )
}

export type SchemaDisplayDescriptionProps = HTMLAttributes<HTMLParagraphElement>

export const SchemaDisplayDescription = ({ className, children, ...props }: SchemaDisplayDescriptionProps) => {
  const { description } = useContext(SchemaDisplayContext)

  return (
    <p className={cn('tw:border-b tw:px-4 tw:py-3 tw:text-muted-foreground tw:text-sm', className)} {...props}>
      {children ?? description}
    </p>
  )
}

export type SchemaDisplayContentProps = HTMLAttributes<HTMLDivElement>

export const SchemaDisplayContent = ({ className, children, ...props }: SchemaDisplayContentProps) => (
  <div className={cn('tw:divide-y', className)} {...props}>
    {children}
  </div>
)

export type SchemaDisplayParameterProps = HTMLAttributes<HTMLDivElement> & SchemaParameter

export const SchemaDisplayParameter = ({ name, type, required, description, location, className, ...props }: SchemaDisplayParameterProps) => (
  <div className={cn('tw:px-4 tw:py-3 tw:pl-10', className)} {...props}>
    <div className='tw:flex tw:items-center tw:gap-2'>
      <span className='tw:font-mono tw:text-sm'>{name}</span>
      <Badge className='tw:text-xs' variant='outline'>
        {type}
      </Badge>
      {location && (
        <Badge className='tw:text-xs' variant='secondary'>
          {location}
        </Badge>
      )}
      {required && (
        <Badge className='tw:bg-red-100 tw:text-red-700 tw:text-xs tw:dark:bg-red-900/30 tw:dark:text-red-400' variant='secondary'>
          required
        </Badge>
      )}
    </div>
    {description && <p className='tw:mt-1 tw:text-muted-foreground tw:text-sm'>{description}</p>}
  </div>
)

export type SchemaDisplayParametersProps = ComponentProps<typeof Collapsible>

export const SchemaDisplayParameters = ({ className, children, ...props }: SchemaDisplayParametersProps) => {
  const { parameters } = useContext(SchemaDisplayContext)

  return (
    <Collapsible className={cn(className)} defaultOpen {...props}>
      <CollapsibleTrigger className='tw:group tw:flex tw:w-full tw:items-center tw:gap-2 tw:px-4 tw:py-3 tw:text-left tw:transition-colors tw:hover:bg-muted/50'>
        <ChevronRightIcon className='tw:size-4 tw:shrink-0 tw:text-muted-foreground tw:transition-transform tw:group-data-[state=open]:rotate-90' />
        <span className='tw:font-medium tw:text-sm'>Parameters</span>
        <Badge className='tw:ml-auto tw:text-xs' variant='secondary'>
          {parameters?.length}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className='tw:divide-y tw:border-t'>{children ?? parameters?.map((param) => <SchemaDisplayParameter key={param.name} {...param} />)}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export type SchemaDisplayPropertyProps = HTMLAttributes<HTMLDivElement> &
  SchemaProperty & {
    depth?: number
  }

export const SchemaDisplayProperty = ({ name, type, required, description, properties, items, depth = 0, className, ...props }: SchemaDisplayPropertyProps) => {
  const hasChildren = properties || items
  const paddingLeft = 40 + depth * 16

  if (hasChildren) {
    return (
      <Collapsible defaultOpen={depth < 2}>
        <CollapsibleTrigger
          className={cn('tw:group tw:flex tw:w-full tw:items-center tw:gap-2 tw:py-3 tw:text-left tw:transition-colors tw:hover:bg-muted/50', className)}
          style={{ paddingLeft }}>
          <ChevronRightIcon className='tw:size-4 tw:shrink-0 tw:text-muted-foreground tw:transition-transform tw:group-data-[state=open]:rotate-90' />
          <span className='tw:font-mono tw:text-sm'>{name}</span>
          <Badge className='tw:text-xs' variant='outline'>
            {type}
          </Badge>
          {required && (
            <Badge className='tw:bg-red-100 tw:text-red-700 tw:text-xs tw:dark:bg-red-900/30 tw:dark:text-red-400' variant='secondary'>
              required
            </Badge>
          )}
        </CollapsibleTrigger>
        {description && (
          <p className='tw:pb-2 tw:text-muted-foreground tw:text-sm' style={{ paddingLeft: paddingLeft + 24 }}>
            {description}
          </p>
        )}
        <CollapsibleContent>
          <div className='tw:divide-y tw:border-t'>
            {properties?.map((prop) => (
              <SchemaDisplayProperty key={prop.name} {...prop} depth={depth + 1} />
            ))}
            {items && <SchemaDisplayProperty {...items} depth={depth + 1} name={`${name}[]`} />}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <div className={cn('tw:py-3 tw:pr-4', className)} style={{ paddingLeft }} {...props}>
      <div className='tw:flex tw:items-center tw:gap-2'>
        {/* Spacer for alignment */}
        <span className='tw:size-4' />
        <span className='tw:font-mono tw:text-sm'>{name}</span>
        <Badge className='tw:text-xs' variant='outline'>
          {type}
        </Badge>
        {required && (
          <Badge className='tw:bg-red-100 tw:text-red-700 tw:text-xs tw:dark:bg-red-900/30 tw:dark:text-red-400' variant='secondary'>
            required
          </Badge>
        )}
      </div>
      {description && <p className='tw:mt-1 tw:pl-6 tw:text-muted-foreground tw:text-sm'>{description}</p>}
    </div>
  )
}

export type SchemaDisplayRequestProps = ComponentProps<typeof Collapsible>

export const SchemaDisplayRequest = ({ className, children, ...props }: SchemaDisplayRequestProps) => {
  const { requestBody } = useContext(SchemaDisplayContext)

  return (
    <Collapsible className={cn(className)} defaultOpen {...props}>
      <CollapsibleTrigger className='tw:group tw:flex tw:w-full tw:items-center tw:gap-2 tw:px-4 tw:py-3 tw:text-left tw:transition-colors tw:hover:bg-muted/50'>
        <ChevronRightIcon className='tw:size-4 tw:shrink-0 tw:text-muted-foreground tw:transition-transform tw:group-data-[state=open]:rotate-90' />
        <span className='tw:font-medium tw:text-sm'>Request Body</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className='tw:border-t'>{children ?? requestBody?.map((prop) => <SchemaDisplayProperty key={prop.name} {...prop} depth={0} />)}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export type SchemaDisplayResponseProps = ComponentProps<typeof Collapsible>

export const SchemaDisplayResponse = ({ className, children, ...props }: SchemaDisplayResponseProps) => {
  const { responseBody } = useContext(SchemaDisplayContext)

  return (
    <Collapsible className={cn(className)} defaultOpen {...props}>
      <CollapsibleTrigger className='tw:group tw:flex tw:w-full tw:items-center tw:gap-2 tw:px-4 tw:py-3 tw:text-left tw:transition-colors tw:hover:bg-muted/50'>
        <ChevronRightIcon className='tw:size-4 tw:shrink-0 tw:text-muted-foreground tw:transition-transform tw:group-data-[state=open]:rotate-90' />
        <span className='tw:font-medium tw:text-sm'>Response</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className='tw:border-t'>{children ?? responseBody?.map((prop) => <SchemaDisplayProperty key={prop.name} {...prop} depth={0} />)}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export type SchemaDisplayProps = HTMLAttributes<HTMLDivElement> & {
  method: HttpMethod
  path: string
  description?: string
  parameters?: SchemaParameter[]
  requestBody?: SchemaProperty[]
  responseBody?: SchemaProperty[]
}

export const SchemaDisplay = ({ method, path, description, parameters, requestBody, responseBody, className, children, ...props }: SchemaDisplayProps) => {
  const contextValue = useMemo(
    () => ({
      description,
      method,
      parameters,
      path,
      requestBody,
      responseBody,
    }),
    [description, method, parameters, path, requestBody, responseBody]
  )

  return (
    <SchemaDisplayContext.Provider value={contextValue}>
      <div className={cn('tw:overflow-hidden tw:rounded-lg tw:border tw:bg-background', className)} {...props}>
        {children ?? (
          <>
            <SchemaDisplayHeader>
              <div className='tw:flex tw:items-center tw:gap-3'>
                <SchemaDisplayMethod />
                <SchemaDisplayPath />
              </div>
            </SchemaDisplayHeader>
            {description && <SchemaDisplayDescription />}
            <SchemaDisplayContent>
              {parameters && parameters.length > 0 && <SchemaDisplayParameters />}
              {requestBody && requestBody.length > 0 && <SchemaDisplayRequest />}
              {responseBody && responseBody.length > 0 && <SchemaDisplayResponse />}
            </SchemaDisplayContent>
          </>
        )}
      </div>
    </SchemaDisplayContext.Provider>
  )
}

export type SchemaDisplayBodyProps = HTMLAttributes<HTMLDivElement>

export const SchemaDisplayBody = ({ className, children, ...props }: SchemaDisplayBodyProps) => (
  <div className={cn('tw:divide-y', className)} {...props}>
    {children}
  </div>
)

export type SchemaDisplayExampleProps = HTMLAttributes<HTMLPreElement>

export const SchemaDisplayExample = ({ className, children, ...props }: SchemaDisplayExampleProps) => (
  <pre className={cn('tw:mx-4 tw:mb-4 tw:overflow-auto tw:rounded-md tw:bg-muted tw:p-4 tw:font-mono tw:text-sm', className)} {...props}>
    {children}
  </pre>
)
