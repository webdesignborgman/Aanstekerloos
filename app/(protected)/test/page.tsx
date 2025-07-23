'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function TestPage() {
  return (
    <main className="min-h-screen bg-neutralBg-50 p-8 space-y-10">
      <h1 className="text-3xl font-bold text-primary-700">Testpagina: Stijlen & Componenten</h1>

      {/* Style varianten */}
      <section className="space-y-6">
        <div className="bg-hero p-12 rounded-lg shadow-lg text-white">
          <h2 className="text-2xl font-bold mb-2">Hero Section</h2>
          <p>Horizontale OKLCH-gradient van primary-400 naar primary-500.</p>
        </div>

        <div className="bg-card p-6 rounded-md shadow-md">
          <h2 className="text-xl font-semibold text-primary-700 mb-2">Card Variant</h2>
          <p>Verticale OKLCH-gradient van primary-100 naar primary-200.</p>
        </div>

        <button className="bg-linear-to-r/oklch from-accent-400 to-accent-500 text-white px-6 py-3 rounded-full shadow hover:opacity-90 transition">
          Accent Button
        </button>

        <span className="inline-block bg-accent-100 text-accent-800 px-3 py-1 rounded-full text-sm font-medium">
          Badge voorbeeld
        </span>

        <div className="bg-accent-200 text-accent-800 p-4 rounded-md shadow-inner">
          <h2 className="font-semibold">Toast / Alert</h2>
          <p>Notificatie-achtige achtergrond, warm en vriendelijk.</p>
        </div>

        <div className="bg-neutralBg-100 p-6 rounded-md">
          <h2 className="font-semibold text-primary-700">Sectie achtergrond</h2>
          <p>Rustige achtergrond voor langere content.</p>
        </div>
      </section>

      {/* shadcn componenten */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-primary-700">shadcn/ui Componenten</h2>

        {/* Button + toast */}
        <Button onClick={() => toast('Hallo van Sonner!')}>Toon Toast</Button>

        {/* Card component */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Card Component</CardTitle>
          </CardHeader>
          <CardContent>Inhoud binnen gradient-card.</CardContent>
        </Card>

        {/* Badge component */}
        <Badge>Nieuw</Badge>

        {/* Select dropdown */}
        <Select>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Kies iets" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="optie-1">Optie 1</SelectItem>
            <SelectItem value="optie-2">Optie 2</SelectItem>
          </SelectContent>
        </Select>

        {/* Switch component */}
        <Switch>Notificaties aan/uit</Switch>

        {/* Tabs component */}
        <Tabs defaultValue="day">
          <TabsList>
            <TabsTrigger value="day">Dag</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Maand</TabsTrigger>
          </TabsList>
          <TabsContent value="day">Dag overzichten…</TabsContent>
          <TabsContent value="week">Weekoverzichten…</TabsContent>
          <TabsContent value="month">Maandoverzichten…</TabsContent>
        </Tabs>

        {/* Tooltip component */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">i</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tooltip met uitleg</p>
          </TooltipContent>
        </Tooltip>

        {/* Dialog component */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog titel</DialogTitle>
            <DialogDescription>Is dit inzetbaar?</DialogDescription>
            <DialogClose asChild>
              <Button variant="outline">Sluiten</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </section>
    </main>
  )
}