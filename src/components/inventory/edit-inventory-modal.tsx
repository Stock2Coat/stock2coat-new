'use client'

import React from 'react'
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
import { InventoryItem } from "@/lib/types"
import { X, Save } from "lucide-react"

const editInventorySchema = z.object({
  ralCode: z.string().min(1, "RAL code is verplicht"),
  brand: z.string().min(1, "Merk is verplicht"),
  productCode: z.string().min(1, "Product code is verplicht"),
  description: z.string().min(1, "Beschrijving is verplicht"),
  currentStock: z.number().min(0, "Voorraad moet positief zijn"),
  maxStock: z.number().min(1, "Maximum voorraad moet groter zijn dan 0"),
  minStock: z.number().min(0, "Minimum voorraad moet positief zijn"),
  location: z.string().min(1, "Locatie is verplicht"),
  supplier: z.string().min(1, "Leverancier is verplicht"),
  weight: z.number().min(0, "Gewicht moet positief zijn"),
  costPerUnit: z.number().min(0, "Prijs moet positief zijn"),
  status: z.enum(['OK', 'GEM', 'LAAG']),
  color: z.string().min(1, "Kleur is verplicht"),
})

type EditInventoryFormValues = z.infer<typeof editInventorySchema>

interface EditInventoryModalProps {
  item: InventoryItem | null
  open: boolean
  onClose: () => void
  onSave: (values: EditInventoryFormValues) => void
}

export function EditInventoryModal({ item, open, onClose, onSave }: EditInventoryModalProps) {
  const form = useForm<EditInventoryFormValues>({
    resolver: zodResolver(editInventorySchema),
    defaultValues: {
      ralCode: item?.ralCode || '',
      brand: item?.brand || '',
      productCode: item?.productCode || '',
      description: item?.description || '',
      currentStock: item?.currentStock || 0,
      maxStock: item?.maxStock || 0,
      minStock: item?.minStock || 0,
      location: item?.location || '',
      supplier: item?.supplier || '',
      weight: item?.weight || 0,
      costPerUnit: item?.costPerUnit || 0,
      status: item?.status || 'OK',
      color: item?.color || '#ffffff',
    },
  })

  // Reset form when item changes
  React.useEffect(() => {
    if (item) {
      form.reset({
        ralCode: item.ralCode,
        brand: item.brand,
        productCode: item.productCode,
        description: item.description,
        currentStock: item.currentStock,
        maxStock: item.maxStock,
        minStock: item.minStock,
        location: item.location,
        supplier: item.supplier,
        weight: item.weight,
        costPerUnit: item.costPerUnit,
        status: item.status,
        color: item.color,
      })
    }
  }, [item, form])

  const onSubmit = (values: EditInventoryFormValues) => {
    onSave(values)
    onClose()
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Inventory Item Bewerken
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basis Informatie</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ralCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RAL Code</FormLabel>
                      <FormControl>
                        <Input placeholder="bijv. 1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kleur</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input type="color" {...field} className="w-16 h-10 p-1" />
                          <Input 
                            placeholder="#ffffff" 
                            value={field.value}
                            onChange={field.onChange}
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Merk</FormLabel>
                      <FormControl>
                        <Input placeholder="bijv. Teknos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Code</FormLabel>
                      <FormControl>
                        <Input placeholder="bijv. PC8052" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschrijving</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Beschrijving van het poedercoating product"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Stock Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Voorraad Informatie</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="currentStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Huidige Voorraad (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Voorraad (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Voorraad (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="OK">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800">OK</Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="GEM">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-orange-100 text-orange-800">GEM</Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="LAAG">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-red-100 text-red-800">LAAG</Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Locatie</FormLabel>
                      <FormControl>
                        <Input placeholder="bijv. A1-01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Supplier & Cost Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Leverancier & Kosten</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leverancier</FormLabel>
                      <FormControl>
                        <Input placeholder="bijv. Teknos Nederland BV" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verpakking Gewicht (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="costPerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prijs per kg (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Annuleren
              </Button>
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Opslaan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}