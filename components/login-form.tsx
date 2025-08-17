"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { Heart, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("l.martinezm22@gmail.com") // Pre-llenado para mejor UX
  const [password, setPassword] = useState("cony2015") // Pre-llenado para testing
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    if (!email || !password) {
      setError("Por favor completa todos los campos")
      setIsSubmitting(false)
      return
    }

    if (!email.includes("@")) {
      setError("Por favor ingresa un email válido")
      setIsSubmitting(false)
      return
    }

    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || "Error desconocido")
    }

    setIsSubmitting(false)
  }

  const isFormDisabled = isLoading || isSubmitting

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Tiempo con mi Hija
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">Accede para ver tu calendario familiar</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isFormDisabled}
                className="h-11 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isFormDisabled}
                className="h-11 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isFormDisabled}
            >
              {isFormDisabled ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Iniciando sesión...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Iniciar Sesión
                </div>
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            💡 Asegúrate de que el servidor Spring Boot esté ejecutándose en localhost:8080
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
