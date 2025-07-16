'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InventoryItem } from "@/lib/types"
import { useAuth } from "@/lib/contexts/auth"
import { 
  Package, 
  Minus, 
  User, 
  FolderOpen, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react"

// Validation schema for consumption form
const consumptionSchema = z.object({
  quantity: z.number().positive("Hoeveelheid moet groter zijn dan 0")
    .refine((val) => val <= 1000, "Hoeveelheid kan niet groter zijn dan 1000 kg"),
  projectOrder: z.string(),
  notes: z.string(),
})

type ConsumptionFormValues = z.infer<typeof consumptionSchema>

interface VerbruikModalProps {
  item: InventoryItem | null
  open: boolean
  onClose: () => void
  onConsume: (itemId: string, quantity: number, projectOrder?: string, notes?: string) => Promise<{ success: boolean; error?: string }>
}

// Mock project/order data - in production this would come from an API
const MOCK_PROJECTS = [
  { id: '1', name: 'Stoel Project - Van Der Berg', code: 'PRJ-2024-001' },
  { id: '2', name: 'Tafel Productie - Meubelmakerij Jansen', code: 'PRJ-2024-002' },
  { id: '3', name: 'Keuken Onderdelen - Interieurbouw BV', code: 'PRJ-2024-003' },
  { id: '4', name: 'Kantoor Meubels - Office Solutions', code: 'PRJ-2024-004' },
  { id: '5', name: 'Tuin Meubilair - GreenSpace Design', code: 'PRJ-2024-005' },
]

export function VerbruikModal({ item, open, onClose, onConsume }: VerbruikModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [projectSearch, setProjectSearch] = useState('')
  const [filteredProjects, setFilteredProjects] = useState(MOCK_PROJECTS)
  const { user } = useAuth()

  const form = useForm<ConsumptionFormValues>({
    resolver: zodResolver(consumptionSchema),
    defaultValues: {
      quantity: 0, // Start with 0 for proper typing
      projectOrder: '',
      notes: '',
    },
    mode: 'onChange', // Enable real-time validation
  })

  // Filter projects based on search input
  useEffect(() => {
    if (!projectSearch) {
      setFilteredProjects(MOCK_PROJECTS)
    } else {
      const filtered = MOCK_PROJECTS.filter(project =>
        project.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
        project.code.toLowerCase().includes(projectSearch.toLowerCase())
      )
      setFilteredProjects(filtered)
    }
  }, [projectSearch])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.reset()
      setError(null)
      setSuccess(false)
      setProjectSearch('')
    }
  }, [open, form])

  const onSubmit = async (values: ConsumptionFormValues) => {
    if (!item) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await onConsume(
        item.id,
        values.quantity,
        values.projectOrder,
        values.notes
      )

      if (result.success) {
        setSuccess(true)
        // Close modal after short delay to show success message
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        let errorMessage = result.error || 'Er is een onverwachte fout opgetreden'
        
        // Provide more helpful error messages
        if (errorMessage.includes('Database function not deployed')) {
          errorMessage = 'Database functie niet gevonden. Neem contact op met de beheerder.'
        } else if (errorMessage.includes('function') && errorMessage.includes('does not exist')) {
          errorMessage = 'Verbruik functie niet beschikbaar. Neem contact op met de beheerder.'
        }
        
        setError(errorMessage)
      }
    } catch (err) {
      setError('Er is een onverwachte fout opgetreden')
      console.error('Consumption error:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        itemId: item?.id,
        quantity: values.quantity
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Minus className="h-5 w-5 text-red-600" />
            Verbruik Registreren
          </DialogTitle>
        </DialogHeader>

        {/* Product Info Header */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg border-2 border-gray-300 flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div>
              <h3 className="font-semibold">RAL {item.ralCode}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  Huidige voorraad: <span className="font-medium">{item.currentStock} kg</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Verbruik succesvol geregistreerd!
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
        

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Quantity Input */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Minus className="h-4 w-4" />
                    Hoeveel verbruikt (kg)
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Typ hoeveelheid..."
                            {...field}
                            value={field.value === undefined ? '' : field.value.toString().replace('.', ',')}
                            onChange={(e) => {
                              let value = e.target.value
                              
                              // Handle empty input
                              if (value === '') {
                                field.onChange(undefined)
                                return
                              }
                              
                              // Replace comma with dot for internal calculation
                              value = value.replace(',', '.')
                              
                              // Only allow numbers and one decimal point
                              if (/^\d*\.?\d*$/.test(value)) {
                                const numValue = Number(value)
                                if (!isNaN(numValue)) {
                                  field.onChange(numValue)
                                }
                              }
                            }}
                            onFocus={(e) => {
                              // Auto-select all text on focus for easy replacement
                              e.target.select()
                            }}
                            disabled={isSubmitting}
                            className={`pr-12 text-lg font-medium ${(
                              field.value !== undefined && field.value > item.currentStock
                              ) ? 'border-red-500 ring-red-500 ring-1 bg-red-50' : (
                                field.value !== undefined && field.value > 0
                                  ? 'border-green-500 ring-green-500 ring-1 bg-green-50'
                                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                              )
                            }`}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                            kg
                          </div>
                        </div>
                        
                        {/* Live calculation display */}
                        {field.value !== undefined && field.value > 0 && (
                          <div className={`text-sm p-2 rounded-md ${(
                            field.value > item.currentStock
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          )}`}>
                            <div className="flex items-center justify-between">
                              <span>Nieuwe voorraad:</span>
                              <span className="font-bold">
                                {field.value > item.currentStock ? '⚠️ ' : '✓ '}
                                {Math.max(0, item.currentStock - field.value).toFixed(1)} kg
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Error message */}
                        {field.value !== undefined && field.value > item.currentStock && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
                            ⚠️ Verbruik kan niet hoger zijn dan de voorraad ({item.currentStock.toFixed(1)} kg)
                          </div>
                        )}
                        
                        {/* Quick Actions */}
                        <div className="space-y-2">
                          <div className="flex gap-2 flex-wrap items-center">
                            <span className="text-xs text-gray-500">Snel invullen:</span>
                            {[0.5, 1.0, 2.0, 5.0].filter(amount => amount <= item.currentStock).map(amount => (
                              <button
                                key={amount}
                                type="button"
                                onClick={() => field.onChange(amount)}
                                disabled={isSubmitting}
                                className={`px-3 py-1 text-xs rounded-full border transition-all hover:scale-105 ${
                                  field.value === amount
                                    ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                                    : 'bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-400'
                                }`}
                              >
                                {amount.toFixed(1)}kg
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => field.onChange(item.currentStock)}
                            disabled={isSubmitting}
                            className="w-full text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-md py-2 transition-colors"
                          >
                            🔄 Gebruik alles ({item.currentStock.toFixed(1)}kg)
                          </button>
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* User Info (Read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Gebruiker
              </label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <Badge variant="outline">{user?.email}</Badge>
              </div>
            </div>

            {/* Project/Order Dropdown */}
            <FormField
              control={form.control}
              name="projectOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Project/Order (optioneel)
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer project of order" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Search input */}
                      <div className="p-2 border-b">
                        <Input
                          placeholder="Zoek project..."
                          value={projectSearch}
                          onChange={(e) => setProjectSearch(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      {/* Project options */}
                      {filteredProjects.map((project) => (
                        <SelectItem key={project.id} value={`${project.code} - ${project.name}`}>
                          <div className="flex flex-col">
                            <span className="font-medium">{project.code}</span>
                            <span className="text-sm text-gray-500">{project.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                      {filteredProjects.length === 0 && (
                        <div className="p-2 text-sm text-gray-500">
                          Geen projecten gevonden
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Opmerkingen (optioneel)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Bijv. specifieke instructies, klant info, etc."
                      {...field}
                      disabled={isSubmitting}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Annuleren
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.watch('quantity') || form.watch('quantity') <= 0 || form.watch('quantity') > item.currentStock}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registreren...
                  </>
                ) : (
                  <>
                    <Minus className="h-4 w-4 mr-2" />
                    Registreer Verbruik
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}