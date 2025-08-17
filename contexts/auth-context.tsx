"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { API_URLS, type LoginResponse } from "@/lib/config"

interface AuthContextType {
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Recuperar token del localStorage al cargar
    const savedToken = localStorage.getItem("auth_token")
    if (savedToken) {
      setToken(savedToken)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)

      const response = await fetch(API_URLS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),
      })

      if (response.ok) {
        const data: LoginResponse = await response.json()
        const authToken = data.token

        if (!authToken) {
          return { success: false, error: "No se recibió el token de autenticación" }
        }

        setToken(authToken)
        localStorage.setItem("auth_token", authToken)
        return { success: true }
      } else {
        // Manejo específico de errores HTTP
        switch (response.status) {
          case 401:
            return { success: false, error: "Email o contraseña incorrectos" }
          case 403:
            return { success: false, error: "Acceso denegado. Contacta al administrador" }
          case 404:
            return { success: false, error: "Servicio no disponible. Intenta más tarde" }
          case 500:
            return { success: false, error: "Error del servidor. Intenta más tarde" }
          default:
            return { success: false, error: "Error de conexión. Verifica tu internet" }
        }
      }
    } catch (error) {
      console.error("Login error:", error)

      // Manejo específico de errores de red
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return { success: false, error: "No se puede conectar al servidor. Verifica que esté ejecutándose" }
      }

      return { success: false, error: "Error inesperado. Intenta de nuevo" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem("auth_token")
  }

  const value = {
    token,
    login,
    logout,
    isAuthenticated: !!token,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
