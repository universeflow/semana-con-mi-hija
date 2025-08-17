import VisitChecker from "@/components/visit-checker"
import ProtectedRoute from "@/components/protected-route"

export default function Home() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">💝 Tiempo con mi Hija</h1>
            <p className="text-muted-foreground text-lg">Verifica y planifica los momentos especiales juntos</p>
          </div>
          <VisitChecker />
        </div>
      </main>
    </ProtectedRoute>
  )
}
