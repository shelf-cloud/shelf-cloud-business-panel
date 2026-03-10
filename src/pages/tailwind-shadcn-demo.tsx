import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@shadcn/ui/alert'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { ButtonGroup, ButtonGroupText } from '@shadcn/ui/button-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shadcn/ui/card'
import { Checkbox } from '@shadcn/ui/checkbox'
import { Combobox, ComboboxCollection, ComboboxContent, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList } from '@shadcn/ui/combobox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@shadcn/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@shadcn/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@shadcn/ui/dropdown-menu'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from '@shadcn/ui/field'
import { Input } from '@shadcn/ui/input'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from '@shadcn/ui/input-group'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle } from '@shadcn/ui/item'
import { Label } from '@shadcn/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shadcn/ui/select'
import { Separator } from '@shadcn/ui/separator'
import { Skeleton } from '@shadcn/ui/skeleton'
import { Slider } from '@shadcn/ui/slider'
import { Spinner } from '@shadcn/ui/spinner'
import { Switch } from '@shadcn/ui/switch'
import { Textarea } from '@shadcn/ui/textarea'
import { Toggle } from '@shadcn/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@shadcn/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shadcn/ui/tooltip'
import { ArrowRight, Bell, Box, CheckCircle2, ChevronsUpDown, CircleHelp, Command, LayoutGrid, Package, Search, Settings2, Sparkles, Wand2 } from 'lucide-react'

type FrameworkOption = {
  label: string
  value: string
}

const frameworkOptions: FrameworkOption[] = [
  { value: 'next', label: 'Next.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'vite', label: 'Vite' },
  { value: 'expo', label: 'Expo' },
]

function ShowcaseCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className='tw:h-full'>
      <CardHeader className='tw:space-y-2'>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className='tw:flex tw:flex-col tw:gap-5'>{children}</CardContent>
    </Card>
  )
}

export default function TailwindShadcnDemo() {
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('Audit coexistence before moving shared shells.')
  const [priority, setPriority] = useState('high')
  const [framework, setFramework] = useState<FrameworkOption | null>(frameworkOptions[0])
  const [notifyOwners, setNotifyOwners] = useState(true)
  const [enableDigest, setEnableDigest] = useState(false)
  const [releaseScore, setReleaseScore] = useState([72])
  const [density, setDensity] = useState('comfortable')
  const [showActivity, setShowActivity] = useState(true)
  const [viewMode, setViewMode] = useState('board')
  const [pinBoard, setPinBoard] = useState(false)

  return (
    <>
      <Head>
        <title>Tailwind + shadcn Component Lab</title>
      </Head>
      <TooltipProvider>
        <section className='tw:min-h-screen tw:bg-background tw:px-4 tw:py-10 tw:text-foreground sm:tw:px-6 lg:tw:px-8'>
          <div className='tw:mx-auto tw:flex tw:w-full tw:max-w-7xl tw:flex-col tw:gap-8'>
            <Card className='tw:overflow-hidden'>
              <CardContent className='tw:relative tw:flex tw:flex-col tw:gap-8 tw:px-6 tw:py-8 sm:tw:px-8 lg:tw:px-10'>
                <div
                  aria-hidden='true'
                  className='tw:pointer-events-none tw:absolute tw:inset-x-0 tw:top-0 tw:h-44 tw:bg-[radial-gradient(circle_at_top,rgba(68,129,253,0.18),transparent_65%)]'
                />
                <div className='tw:relative tw:flex tw:flex-col tw:gap-6 lg:tw:flex-row lg:tw:items-end lg:tw:justify-between'>
                  <div className='tw:max-w-4xl tw:space-y-4'>
                    <div className='tw:flex tw:flex-wrap tw:items-center tw:gap-2'>
                      <Badge>Component lab</Badge>
                      <Badge variant='outline'>Bootstrap-safe coexistence</Badge>
                      <Badge variant='secondary'>Prefixed utilities only</Badge>
                    </div>
                    <div className='tw:space-y-3'>
                      <h1 className='tw:max-w-3xl tw:text-3xl tw:font-semibold tw:tracking-tight sm:tw:text-4xl'>
                        Newly installed shadcn primitives now render with explicit resets, semantic borders, and plugin-free motion states.
                      </h1>
                      <p className='tw:max-w-3xl tw:text-base tw:leading-7 tw:text-muted-foreground sm:tw:text-lg'>
                        This page is the validation surface for the new stack. Every example below is built with the prefixed Tailwind and shadcn layer only, without disturbing the
                        existing Reactstrap and Bootstrap screens.
                      </p>
                    </div>
                  </div>
                  <div className='tw:flex tw:flex-wrap tw:items-center tw:gap-3'>
                    <Button asChild>
                      <Link href='/'>
                        Return Home
                        <ArrowRight />
                      </Link>
                    </Button>
                    <Button asChild variant='outline'>
                      <Link href='https://ui.shadcn.com/docs/components-json' target='_blank' rel='noreferrer'>
                        Registry settings
                      </Link>
                    </Button>
                  </div>
                </div>

                <Alert>
                  <Sparkles />
                  <AlertTitle>Shared primitive normalization is active</AlertTitle>
                  <AlertDescription>
                    Native controls now opt into explicit `appearance`, border, focus ring, and overlay surface styles inside `@shadcn/ui` instead of relying on Tailwind Preflight.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <div className='tw:grid tw:gap-6 xl:tw:grid-cols-2'>
              <ShowcaseCard title='Actions' description='Button, button group, toggle, toggle group, tooltip, dropdown menu, dialog, and drawer.'>
                <div className='tw:flex tw:flex-wrap tw:gap-3'>
                  <Button>Primary action</Button>
                  <Button variant='outline'>Secondary action</Button>
                  <Button variant='ghost'>Ghost action</Button>
                </div>

                <ButtonGroup>
                  <Button variant='outline'>Draft</Button>
                  <Button variant='outline'>Preview</Button>
                  <Button variant='default'>Publish</Button>
                </ButtonGroup>

                <ButtonGroup>
                  <ButtonGroupText>
                    <Command className='tw:size-4' />
                    Filters
                  </ButtonGroupText>
                  <Button variant='outline'>In stock</Button>
                  <Button variant='outline'>Backordered</Button>
                </ButtonGroup>

                <div className='tw:flex tw:flex-wrap tw:items-center tw:gap-3'>
                  <Toggle aria-label='Pin view' pressed={pinBoard} onPressedChange={setPinBoard} variant='outline'>
                    <LayoutGrid />
                    Pin board
                  </Toggle>

                  <ToggleGroup type='single' value={viewMode} onValueChange={(value) => value && setViewMode(value)} variant='default'>
                    <ToggleGroupItem value='board'>Board</ToggleGroupItem>
                    <ToggleGroupItem value='list'>List</ToggleGroupItem>
                    <ToggleGroupItem value='timeline'>Timeline</ToggleGroupItem>
                  </ToggleGroup>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='ghost' size='icon' aria-label='Why this matters'>
                        <CircleHelp />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>New primitives keep their own reset contract without changing Bootstrap screens.</TooltipContent>
                  </Tooltip>
                </div>

                <div className='tw:flex tw:flex-wrap tw:gap-3'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline'>
                        <Settings2 />
                        Open menu
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='start'>
                      <DropdownMenuLabel>Board preferences</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem checked={showActivity} onCheckedChange={(checked) => setShowActivity(checked === true)}>
                        Show activity feed
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Density</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
                            <DropdownMenuRadioItem value='compact'>Compact</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value='comfortable'>Comfortable</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value='spacious'>Spacious</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Duplicate board</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Open dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve the coexistence rollout</DialogTitle>
                        <DialogDescription>The modal, its close button, and the overlay all use the normalized shadcn-only layer.</DialogDescription>
                      </DialogHeader>
                      <Separator />
                      <div className='tw:space-y-2 tw:text-sm tw:text-muted-foreground'>
                        <p>Tailwind stays prefixed.</p>
                        <p>Bootstrap keeps global control.</p>
                        <p>New primitives normalize themselves at the shared component layer.</p>
                      </div>
                      <DialogFooter showCloseButton>
                        <Button>Approve</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant='outline'>Open drawer</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Drawer surface validation</DrawerTitle>
                        <DrawerDescription>The drawer keeps its own border and shadow tokens instead of inheriting browser defaults.</DrawerDescription>
                      </DrawerHeader>
                      <div className='tw:px-4 tw:pb-2 tw:text-sm tw:text-muted-foreground'>
                        <div className='tw:rounded-xl tw:border tw:border-border tw:bg-muted/50 tw:p-4'>This is the kind of leaf screen where the new stack can ship first.</div>
                      </div>
                      <DrawerFooter>
                        <Button>Continue</Button>
                        <Button variant='outline'>Keep exploring</Button>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                </div>
              </ShowcaseCard>

              <ShowcaseCard title='Fields' description='Field, input, input group, label, checkbox, switch, select, combobox, slider, textarea.'>
                <FieldSet>
                  <FieldLegend>Release notifications</FieldLegend>
                  <FieldGroup>
                    <Field data-invalid={!email || undefined}>
                      <FieldLabel htmlFor='release-email'>Owner email</FieldLabel>
                      <FieldContent>
                        <Input
                          id='release-email'
                          type='email'
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          aria-invalid={!email}
                          placeholder='owner@workspace.com'
                        />
                        <FieldDescription>This field verifies the normalized input baseline without relying on Preflight.</FieldDescription>
                        <FieldError errors={!email ? [{ message: 'An owner email is required before release notifications can send.' }] : undefined} />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor='release-notes'>Release notes</FieldLabel>
                      <FieldContent>
                        <Textarea id='release-notes' value={notes} onChange={(event) => setNotes(event.target.value)} />
                        <FieldDescription>Textarea shares the same reset and focus ring contract as the input.</FieldDescription>
                      </FieldContent>
                    </Field>

                    <Field orientation='responsive'>
                      <FieldContent>
                        <FieldTitle>Priority lane</FieldTitle>
                        <FieldDescription>Select uses the same semantic field tokens as inputs.</FieldDescription>
                      </FieldContent>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className='tw:w-full sm:tw:w-56'>
                          <SelectValue placeholder='Pick a priority' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='low'>Low</SelectItem>
                          <SelectItem value='medium'>Medium</SelectItem>
                          <SelectItem value='high'>High</SelectItem>
                          <SelectItem value='critical'>Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor='inventory-search'>Input group</FieldLabel>
                      <FieldContent>
                        <InputGroup>
                          <InputGroupAddon align='inline-start'>
                            <InputGroupText>
                              <Search />
                            </InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput id='inventory-search' placeholder='Search inventory by SKU or title' />
                          <InputGroupAddon align='inline-end'>
                            <InputGroupButton size='icon-xs' variant='ghost' aria-label='Run search'>
                              <ArrowRight />
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                        <FieldDescription>The wrapper owns the border and focus state while the inner controls stay borderless.</FieldDescription>
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldContent>
                        <FieldTitle>Framework combobox</FieldTitle>
                        <FieldDescription>Base UI combobox content is using the same surface tokens as menus and popovers.</FieldDescription>
                        <Combobox items={frameworkOptions} value={framework} onValueChange={(value) => setFramework(value as FrameworkOption | null)}>
                          <ComboboxInput placeholder='Pick a frontend runtime' showClear />
                          <ComboboxContent>
                            <ComboboxList>
                              <ComboboxEmpty>No framework matches your query.</ComboboxEmpty>
                              <ComboboxGroup>
                                <ComboboxLabel>Available runtimes</ComboboxLabel>
                                <ComboboxCollection>
                                  {(item: FrameworkOption) => (
                                    <ComboboxItem key={item.value} value={item}>
                                      {item.label}
                                    </ComboboxItem>
                                  )}
                                </ComboboxCollection>
                              </ComboboxGroup>
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      </FieldContent>
                    </Field>
                  </FieldGroup>

                  <FieldSeparator>Preferences</FieldSeparator>

                  <div className='tw:grid tw:gap-4 md:tw:grid-cols-2'>
                    <Field orientation='horizontal'>
                      <Checkbox id='notify-owners' checked={notifyOwners} onCheckedChange={(checked) => setNotifyOwners(checked === true)} />
                      <FieldContent>
                        <FieldLabel htmlFor='notify-owners'>Notify owners on publish</FieldLabel>
                        <FieldDescription>Email the owning team when a rollout passes validation.</FieldDescription>
                      </FieldContent>
                    </Field>

                    <Field orientation='horizontal'>
                      <Switch checked={enableDigest} onCheckedChange={setEnableDigest} />
                      <FieldContent>
                        <Label>Nightly digest</Label>
                        <FieldDescription>Send a daily coexistence status summary after midnight.</FieldDescription>
                      </FieldContent>
                    </Field>
                  </div>

                  <Field>
                    <FieldContent>
                      <FieldTitle>Confidence score</FieldTitle>
                      <FieldDescription>Slider thumbs now opt out of native appearance as well.</FieldDescription>
                    </FieldContent>
                    <Slider value={releaseScore} onValueChange={setReleaseScore} max={100} step={1} />
                  </Field>
                </FieldSet>
              </ShowcaseCard>
            </div>

            <div className='tw:grid tw:gap-6 xl:tw:grid-cols-[1.1fr_0.9fr]'>
              <ShowcaseCard title='Items and Display' description='Alert, badge, item, separator, skeleton, spinner, and status surfaces.'>
                <div className='tw:flex tw:flex-wrap tw:items-center tw:gap-2'>
                  <Badge>Live</Badge>
                  <Badge variant='secondary'>Legacy safe</Badge>
                  <Badge variant='outline'>No Preflight</Badge>
                  <Badge variant='ghost'>Pilot</Badge>
                </div>

                <ItemGroup className='tw:rounded-xl tw:border tw:border-border tw:bg-card'>
                  <Item variant='outline' className='tw:rounded-none tw:border-0 tw:border-b tw:border-border'>
                    <ItemHeader>
                      <ItemTitle>Warehouse board</ItemTitle>
                      <Badge variant='secondary'>Stable</Badge>
                    </ItemHeader>
                    <ItemMedia variant='icon'>
                      <Package />
                    </ItemMedia>
                    <ItemContent>
                      <ItemDescription>Shared data hooks can be reused here while the visual layer stays inside the new shadcn namespace.</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Button variant='ghost' size='sm'>
                        Inspect
                      </Button>
                    </ItemActions>
                  </Item>
                  <ItemSeparator />
                  <Item variant='muted' className='tw:rounded-none tw:border-0'>
                    <ItemMedia variant='icon'>
                      <Box />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Component registry</ItemTitle>
                      <ItemDescription>Newly installed primitives now carry their own resets, borders, and overlay styling.</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Spinner className='tw:size-4' />
                    </ItemActions>
                  </Item>
                </ItemGroup>

                <Separator />

                <div className='tw:grid tw:gap-3 sm:tw:grid-cols-3'>
                  <Skeleton className='tw:h-16 tw:w-full' />
                  <Skeleton className='tw:h-16 tw:w-full' />
                  <Skeleton className='tw:h-16 tw:w-full' />
                </div>
              </ShowcaseCard>

              <ShowcaseCard title='Usage Boundary' description='A compact summary of how to adopt the new layer without disturbing Bootstrap.'>
                <Alert>
                  <CheckCircle2 />
                  <AlertTitle>Recommended pattern</AlertTitle>
                  <AlertDescription>Keep legacy pages on Reactstrap and Bootstrap. Use the new stack for new routes, leaf components, and isolated rewrites.</AlertDescription>
                </Alert>

                <div className='tw:grid tw:gap-3'>
                  <div className='tw:rounded-xl tw:border tw:border-border tw:bg-muted/50 tw:p-4'>
                    <p className='tw:text-sm tw:font-semibold'>Do share</p>
                    <p className='tw:mt-2 tw:text-sm tw:text-muted-foreground'>Hooks, data fetching, business logic, and page-level state.</p>
                  </div>
                  <div className='tw:rounded-xl tw:border tw:border-border tw:bg-muted/50 tw:p-4'>
                    <p className='tw:text-sm tw:font-semibold'>Do isolate</p>
                    <p className='tw:mt-2 tw:text-sm tw:text-muted-foreground'>Buttons, fields, menus, overlays, and layout shells built from `@shadcn/ui`.</p>
                  </div>
                </div>

                <div className='tw:flex tw:flex-wrap tw:items-center tw:gap-3'>
                  <Badge variant='outline'>
                    <Bell className='tw:mr-1 tw:size-3' />
                    Explicit resets
                  </Badge>
                  <Badge variant='outline'>
                    <ChevronsUpDown className='tw:mr-1 tw:size-3' />
                    Prefix aligned
                  </Badge>
                  <Badge variant='outline'>
                    <Wand2 className='tw:mr-1 tw:size-3' />
                    Future installs ready
                  </Badge>
                </div>

                <Button asChild variant='outline'>
                  <Link href='https://ui.shadcn.com/docs/components-json' target='_blank' rel='noreferrer'>
                    Review the registry config
                  </Link>
                </Button>
              </ShowcaseCard>
            </div>
          </div>
        </section>
      </TooltipProvider>
    </>
  )
}
