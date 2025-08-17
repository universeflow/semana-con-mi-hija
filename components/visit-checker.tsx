"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Heart, Mail, CalendarPlus, Clock, X, Loader2, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { API_URLS, type VisitResponse } from "@/lib/config"

interface VisitResult {
  hasVisit: boolean
  weekNumber: number
  startDate: string
  endDate: string
  inputDate: string
  mensaje?: string
  correo?: string
}

export default function VisitChecker() {
  const { token, logout } = useAuth()
  const [inputDate, setInputDate] = useState("")
  const [result, setResult] = useState<VisitResult | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (inputDate) {
      const selectedDate = new Date(inputDate + "T00:00:00")
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    }
  }, [inputDate])

  const getMondayOfWeek = (date: Date): Date => {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(date.setDate(diff))
  }

  const getWeekOfMonth = (date: Date): number => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

    const firstDay = new Date(year, month, 1)

    let firstMonday = new Date(firstDay)
    const firstDayOfWeek = firstDay.getDay()

    if (firstDayOfWeek === 1) {
      firstMonday = new Date(firstDay)
    } else if (firstDayOfWeek === 0) {
      firstMonday.setDate(2)
    } else {
      const daysUntilMonday = 8 - firstDayOfWeek
      firstMonday.setDate(1 + daysUntilMonday)
    }

    if (firstMonday.getMonth() !== month) {
      const inputDate = new Date(year, month, day)
      const dayOfMonth = inputDate.getDate()
      return Math.ceil(dayOfMonth / 7)
    }

    const inputDate = new Date(year, month, day)
    const diffTime = inputDate.getTime() - firstMonday.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const weekNumber = Math.floor(diffDays / 7) + 1

    console.log(
      `[v0] Fecha: ${day}/${month + 1}/${year}, Primer lunes: ${firstMonday.getDate()}/${firstMonday.getMonth() + 1}, Semana: ${weekNumber}`,
    )

    return Math.max(1, weekNumber)
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const generateCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    const visitImages = ["/papa-hija-guitarra.png", "/papa-hija-selfie.png"]

    const consultedWeekDays: number[] = []
    if (result && inputDate) {
      const consultedDate = new Date(inputDate + "T00:00:00")
      if (consultedDate.getMonth() === month && consultedDate.getFullYear() === year) {
        const startMonday = getMondayOfWeek(new Date(consultedDate))
        for (let i = 0; i < 7; i++) {
          const weekDay = new Date(startMonday)
          weekDay.setDate(startMonday.getDate() + i)
          if (weekDay.getMonth() === month) {
            consultedWeekDays.push(weekDay.getDate())
          }
        }
      }
    }

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const weekNumber = getWeekOfMonth(date)
      const hasVisit = weekNumber % 2 === 0
      const visitImage = hasVisit ? visitImages[day % visitImages.length] : null

      const isInConsultedWeek = consultedWeekDays.includes(day)
      const consultedWeekStyle = isInConsultedWeek
        ? result?.hasVisit
          ? "consulted-week-visit"
          : "consulted-week-no-visit"
        : null

      days.push({
        day,
        date,
        hasVisit,
        visitImage,
        isInConsultedWeek,
        consultedWeekStyle,
      })
    }

    return days
  }

  const checkVisitDate = async () => {
    if (!inputDate) return

    setIsLoading(true)

    try {
      const microserviceUrl = API_URLS.GET_DATE(inputDate)
      console.log("[v0] Consultando microservicio en:", microserviceUrl)

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
        console.log("[v0] Token agregado al header")
        console.log("[v0] Token length:", token.length)
        console.log("[v0] Token preview:", token.substring(0, 20) + "...")
      } else {
        console.log("[v0] No hay token disponible")
        console.log("[v0] Token value:", token)
        console.log("[v0] LocalStorage token:", localStorage.getItem("auth_token"))
      }

      const response = await fetch(microserviceUrl, {
        method: "GET",
        headers,
      })

      console.log("[v0] Status de respuesta:", response.status)
      console.log("[v0] Headers de respuesta:", response.headers)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.log("[v0] Respuesta no es JSON:", textResponse.substring(0, 200))
        throw new Error("El microservicio no devolvió JSON válido")
      }

      const data: VisitResponse = await response.json()

      console.log("[v0] Respuesta del microservicio:", data)
      console.log("[v0] Mensaje recibido:", `"${data.mensaje}"`)
      console.log("[v0] Comparación con 'Semana con Cony':", data.mensaje === "Semana con Cony")

      const date = new Date(inputDate + "T00:00:00")
      const weekNumber = getWeekOfMonth(date)

      const hasVisit = data.mensaje?.trim() === "Semana con Cony"
      console.log("[v0] ¿Tiene visita?:", hasVisit)

      const startDate = formatDate(new Date(data.fechaInicio + "T00:00:00"))
      const endDate = formatDate(new Date(data.fechaFin + "T00:00:00"))

      setResult({
        hasVisit,
        weekNumber,
        startDate,
        endDate,
        inputDate: formatDate(date),
        mensaje: data.mensaje,
        correo: data.correo,
      })

      if (data.correo && !email) {
        setEmail(data.correo)
      }
    } catch (error) {
      console.error("[v0] Error al consultar microservicio:", error)

      const date = new Date(inputDate + "T00:00:00")
      const weekNumber = getWeekOfMonth(date)
      const hasVisitLocal = weekNumber % 2 === 0

      const startMonday = getMondayOfWeek(new Date(date))
      const endMonday = new Date(startMonday)
      endMonday.setDate(endMonday.getDate() + 7)

      setResult({
        hasVisit: hasVisitLocal,
        weekNumber,
        startDate: formatDate(startMonday),
        endDate: formatDate(endMonday),
        inputDate: formatDate(date),
        mensaje: hasVisitLocal ? "Semana con Cony (modo local)" : "Sin visita (modo local)",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendEmailReminder = () => {
    if (!result || !result.hasVisit || !email) return

    const subject = `Recordatorio: ${result.mensaje || "Tiempo con mi hija"} - ${result.startDate}`
    const body = `¡Hola!\n\nTe recuerdo que tienes tiempo programado con tu hija:\n\nFecha de inicio: ${result.startDate}\nFecha de fin: ${result.endDate}\n\n¡Que disfruten mucho juntos! 💝`

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  const addToGoogleCalendar = () => {
    if (!result || !result.hasVisit) return

    const startDate = new Date(inputDate + "T09:00:00")
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 8)

    const title = result.mensaje || "Tiempo con mi hija 💝"
    const details = "Tiempo especial programado para estar con mi hija. ¡A disfrutar juntos!"

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${endDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z&details=${encodeURIComponent(details)}`

    window.open(googleCalendarUrl, "_blank")
  }

  const clearResult = () => {
    setResult(null)
    setInputDate("")
  }

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1))
  }

  const calendarDays = generateCalendar()
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Sesión activa</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="text-destructive hover:text-destructive-foreground hover:bg-destructive bg-transparent"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <span className="text-lg md:text-xl">Calendario de Visitas</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)} className="px-3">
                ←
              </Button>
              <span className="font-medium min-w-[140px] md:min-w-[160px] text-center text-sm md:text-base">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth(1)} className="px-3">
                →
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-4">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div key={day} className="text-center text-xs md:text-sm font-medium text-muted-foreground p-1 md:p-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {calendarDays.map((dayData, index) => (
              <div
                key={index}
                className={`
                  aspect-square flex flex-col items-center justify-center text-xs md:text-sm rounded-md md:rounded-lg border-2 transition-all relative overflow-hidden min-h-[40px] md:min-h-[60px]
                  ${
                    dayData
                      ? dayData.isInConsultedWeek
                        ? dayData.consultedWeekStyle === "consulted-week-visit"
                          ? "bg-green-100 border-green-400 text-green-800 shadow-lg ring-2 ring-green-300"
                          : "bg-gray-100 border-gray-400 text-gray-700 shadow-lg ring-2 ring-gray-300"
                        : dayData.hasVisit
                          ? "bg-primary text-primary-foreground border-primary shadow-lg transform hover:scale-105"
                          : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                      : "border-transparent"
                  }
                `}
              >
                {dayData && (
                  <>
                    {dayData.hasVisit && dayData.visitImage && (
                      <div className="absolute inset-0 opacity-20">
                        <img
                          src={dayData.visitImage || "/placeholder.svg"}
                          alt="Actividad padre-hija"
                          className="w-full h-full object-cover rounded-md md:rounded-lg"
                        />
                      </div>
                    )}
                    <div className="relative z-10 flex flex-col items-center">
                      <span className="font-medium text-xs">{dayData.day}</span>
                      {dayData.hasVisit && (
                        <div className="flex items-center gap-1 mt-0.5 md:mt-1">
                          <Heart className="h-2 w-2 md:h-3 md:w-3" />
                          {dayData.visitImage && (
                            <img
                              src={dayData.visitImage || "/placeholder.svg"}
                              alt="Día especial"
                              className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-primary-foreground/30"
                            />
                          )}
                        </div>
                      )}
                      {dayData.isInConsultedWeek && (
                        <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-2 h-2 md:w-3 md:h-3 rounded-full bg-current opacity-60"></div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 md:gap-4 mt-3 md:mt-4 text-xs md:text-sm flex-wrap">
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-primary rounded border-2 border-primary"></div>
              <span>Días de visita</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-muted/50 rounded border-2 border-border"></div>
              <span>Días normales</span>
            </div>
            {result && (
              <>
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-green-100 rounded border-2 border-green-400 ring-1 ring-green-300"></div>
                  <span className="hidden sm:inline">Semana consultada - Con Cony</span>
                  <span className="sm:hidden">Con Cony</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-100 rounded border-2 border-gray-400 ring-1 ring-gray-300"></div>
                  <span className="hidden sm:inline">Semana consultada - Sin visita</span>
                  <span className="sm:hidden">Sin visita</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Verificar fecha específica
          </CardTitle>
          <CardDescription className="text-sm">
            Consulta el microservicio autenticado para verificar si corresponde "Semana con Cony"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="flex-1 text-sm md:text-base"
            />
            <Button
              onClick={checkVisitDate}
              disabled={!inputDate || isLoading || !token}
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-sm md:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Consultando...
                </>
              ) : (
                "Verificar"
              )}
            </Button>
          </div>
          {!token && (
            <p className="text-sm text-muted-foreground">⚠️ Se requiere autenticación para consultar el microservicio</p>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className={result.hasVisit ? "border-primary/50 bg-primary/5" : "border-muted bg-muted/20"}>
          <CardHeader className="pb-4">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {result.hasVisit ? (
                  <>
                    <Heart className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <span className="text-primary text-sm md:text-base">{result.mensaje} 💝</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm md:text-base">
                      {result.mensaje || "No hay visita programada"}
                    </span>
                  </>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearResult}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-xs md:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <span className="font-medium">Fecha consultada:</span>
                <span className="break-all">{result.inputDate}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <span className="font-medium">Semana del mes:</span>
                <span>Semana {result.weekNumber}</span>
              </div>
              {result.correo && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="font-medium">Correo:</span>
                  <span className="break-all">{result.correo}</span>
                </div>
              )}

              {result.hasVisit && (
                <>
                  <div className="mt-4 p-3 md:p-4 bg-card rounded-lg border border-primary/20">
                    <h4 className="font-medium mb-2 text-primary flex items-center gap-2 text-sm md:text-base">
                      <Heart className="h-4 w-4" />
                      Período completo de visita:
                    </h4>
                    <div className="space-y-1 text-xs md:text-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <span className="font-medium">Desde:</span>
                        <span className="break-all">{result.startDate}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <span className="font-medium">Hasta (incluido):</span>
                        <span className="break-all">{result.endDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 md:p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                    <h4 className="font-medium mb-3 text-secondary text-sm md:text-base">Recordatorios y Calendario</h4>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          type="email"
                          placeholder="tu-email@ejemplo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 text-sm"
                        />
                        <Button
                          onClick={sendEmailReminder}
                          disabled={!email}
                          variant="outline"
                          className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent w-full sm:w-auto text-sm"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Enviar Email</span>
                          <span className="sm:hidden">Email</span>
                        </Button>
                      </div>
                      <Button
                        onClick={addToGoogleCalendar}
                        className="w-full bg-secondary hover:bg-secondary/90 text-sm md:text-base"
                      >
                        <CalendarPlus className="h-4 w-4 mr-2" />
                        Agregar a Google Calendar
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <Heart className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            ¿Cómo funciona?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs md:text-sm text-muted-foreground space-y-2">
          <p>
            • El sistema consulta un <strong>microservicio Java autenticado</strong> para verificar las fechas
          </p>
          <p>• Se envía el token JWT en el header Authorization para autenticar las peticiones</p>
          <p>
            • Solo se marcan en naranja las fechas cuando el mensaje es <strong>"Semana con Cony"</strong>
          </p>
          <p>• El calendario visual muestra todos los días de visita del mes con corazones 💝</p>
          <p>• Puedes enviar recordatorios por email y agregar las fechas a Google Calendar</p>
          <p>• El microservicio devuelve las fechas exactas de inicio y fin del período</p>
        </CardContent>
      </Card>
    </div>
  )
}
