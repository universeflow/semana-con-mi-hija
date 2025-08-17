"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Plane, X } from "lucide-react"

interface TravelResult {
  needsTravel: boolean
  weekNumber: number
  startDate: string
  endDate: string
  inputDate: string
}

export default function TravelChecker() {
  const [inputDate, setInputDate] = useState("")
  const [result, setResult] = useState<TravelResult | null>(null)

  // Función para obtener el lunes de una semana
  const getMondayOfWeek = (date: Date): Date => {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Ajustar para que lunes sea día 1
    return new Date(date.setDate(diff))
  }

  // Función para obtener el número de semana del mes
  const getWeekOfMonth = (date: Date): number => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    const firstMonday = getMondayOfWeek(new Date(firstDay))

    // Si el primer lunes está en el mes anterior, ajustar
    if (firstMonday.getMonth() !== date.getMonth()) {
      firstMonday.setDate(firstMonday.getDate() + 7)
    }

    const inputMonday = getMondayOfWeek(new Date(date))
    const diffTime = inputMonday.getTime() - firstMonday.getTime()
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))

    return diffWeeks + 1
  }

  // Función para formatear fecha
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const checkTravelDate = () => {
    if (!inputDate) return

    const date = new Date(inputDate + "T00:00:00")
    const weekNumber = getWeekOfMonth(date)

    // Los viajes son en semanas impares (1, 3, 5)
    const needsTravel = weekNumber % 2 === 1

    if (needsTravel) {
      // Calcular el rango de lunes a lunes
      const startMonday = getMondayOfWeek(new Date(date))
      const endMonday = new Date(startMonday)
      endMonday.setDate(endMonday.getDate() + 7)

      setResult({
        needsTravel: true,
        weekNumber,
        startDate: formatDate(startMonday),
        endDate: formatDate(endMonday),
        inputDate: formatDate(date),
      })
    } else {
      setResult({
        needsTravel: false,
        weekNumber,
        startDate: "",
        endDate: "",
        inputDate: formatDate(date),
      })
    }
  }

  const clearResult = () => {
    setResult(null)
    setInputDate("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Ingresa la fecha a verificar
          </CardTitle>
          <CardDescription>Los viajes se realizan en semanas intercaladas (semanas 1, 3, 5 del mes)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input type="date" value={inputDate} onChange={(e) => setInputDate(e.target.value)} className="flex-1" />
            <Button onClick={checkTravelDate} disabled={!inputDate}>
              Verificar
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card
          className={
            result.needsTravel
              ? "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
              : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {result.needsTravel ? (
                  <>
                    <Plane className="h-5 w-5 text-orange-600" />
                    <span className="text-orange-800 dark:text-orange-200">¡Sí necesitas viajar!</span>
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 dark:text-green-200">No necesitas viajar</span>
                  </>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearResult}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div>
                <span className="font-medium">Fecha consultada:</span> {result.inputDate}
              </div>
              <div>
                <span className="font-medium">Semana del mes:</span> Semana {result.weekNumber}
              </div>

              {result.needsTravel && (
                <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg border">
                  <h4 className="font-medium mb-2 text-orange-800 dark:text-orange-200">Período de viaje completo:</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Desde:</span> {result.startDate}
                    </div>
                    <div>
                      <span className="font-medium">Hasta:</span> {result.endDate}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            • Los viajes se realizan en <strong>semanas intercaladas</strong> del mes (semanas 1, 3, 5)
          </p>
          <p>
            • Cada viaje dura una <strong>semana completa de lunes a lunes</strong>
          </p>
          <p>• Si la fecha que consultas cae en una semana de viaje, se mostrará el período completo</p>
          <p>
            • Ejemplo: Si consultas el 16-08-2025 y es semana de viaje, verás desde el lunes 11-08-2025 hasta el lunes
            18-08-2025
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
