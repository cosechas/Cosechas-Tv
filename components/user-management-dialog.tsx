"use client"

import { useState, useEffect } from "react"
import { fetchUsers, createUser, deleteUser, toggleUserStatusAction, updateUser } from "@/app/actions/user-actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Trash2, UserCog, Mail, ShieldAlert, ShieldCheck, Eye, EyeOff, Edit } from "lucide-react"

type Role = "Admin" | "Usuario"
type Status = "Activo" | "Inactivo"

interface AppUser {
  id: string
  name: string
  email: string
  role: Role
  status: Status
  lastLogin: string
}

// Real state will be fetched instead of mocks

interface UserManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserManagementDialog({ open, onOpenChange }: UserManagementDialogProps) {
  const [users, setUsers] = useState<AppUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  
  // Form state
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [newRole, setNewRole] = useState<Role>("Usuario")

  const loadUsers = async () => {
    setIsLoading(true)
    setErrorMsg("")
    const res = await fetchUsers()
    if (res.error) {
      setErrorMsg(res.error)
    } else if (res.users) {
      setUsers(res.users as AppUser[])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (open) {
      loadUsers()
    }
  }, [open])

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newEmail) return
    if (!editingUser && !newPassword) return

    setIsLoading(true)
    
    if (editingUser) {
      const res = await updateUser(editingUser.id, {
        name: newName,
        role: newRole,
        password: newPassword,
        currentStatus: editingUser.status
      })
      if (res.error) {
        setErrorMsg(res.error)
        setIsLoading(false)
        return
      }
    } else {
      const res = await createUser({
        name: newName,
        email: newEmail,
        role: newRole,
        password: newPassword
      })

      if (res.error) {
        setErrorMsg(res.error)
        setIsLoading(false)
        return
      }
    }

    await loadUsers()
    setIsCreating(false)
    setEditingUser(null)
    setNewName("")
    setNewEmail("")
    setNewPassword("")
    setNewRole("Usuario")
  }

  const handleEditClick = (user: AppUser) => {
    setEditingUser(user)
    setNewName(user.name)
    setNewEmail(user.email)
    setNewRole(user.role)
    setNewPassword("")
  }

  const handleCancelForm = () => {
    setIsCreating(false)
    setEditingUser(null)
    setNewName("")
    setNewEmail("")
    setNewPassword("")
    setNewRole("Usuario")
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("¿Está seguro de querer eliminar este usuario?")) return
    setIsLoading(true)
    const res = await deleteUser(id)
    if (res.error) setErrorMsg(res.error)
    await loadUsers()
  }

  const toggleUserStatus = async (id: string, currentStatus: Status) => {
    setIsLoading(true)
    const res = await toggleUserStatusAction(id, currentStatus)
    if (res.error) setErrorMsg(res.error)
    await loadUsers()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <UserCog className="h-6 w-6" />
            Configuración y Gestión de Usuarios
          </DialogTitle>
          <DialogDescription>
            Administra los accesos al sistema, añade nuevos miembros o revoca permisos.
          </DialogDescription>
        </DialogHeader>

        {isCreating || editingUser ? (
          <div className="bg-muted/30 p-4 rounded-lg border mt-4">
            <h3 className="text-lg font-medium mb-4">{editingUser ? "Editar usuario" : "Crear nuevo usuario"}</h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input 
                    id="name" 
                    placeholder="Ej. Carlos Rodriguez" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className={editingUser ? "text-muted-foreground" : ""}>Correo electrónico</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="ejemplo@cosechas.com" 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    disabled={!!editingUser}
                    className={editingUser ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={newRole} onValueChange={(value: Role) => setNewRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Usuario">Usuario (Permisos básicos)</SelectItem>
                      <SelectItem value="Admin">Administrador (Acceso total)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{editingUser ? "Nueva Contraseña (Opcional)" : "Contraseña (Mínimo 6 caracteres)"}</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 caracteres" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required={!editingUser}
                      minLength={6}
                      className="pr-10"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={handleCancelForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Guardando..." : (editingUser ? "Guardar cambios" : "Guardar usuario")}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuarios..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden md:table-cell">Último acceso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Cargando usuarios...
                      </TableCell>
                    </TableRow>
                  ) : errorMsg ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-destructive">
                        {errorMsg?.includes('service_role') ? (
                          <span>Por favor configure <code className="bg-muted px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> en su entorno local `.env.local` para poder cargar los usuarios.</span>
                        ) : (
                          <span>Error: {errorMsg}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {user.role === "Admin" ? (
                              <ShieldAlert className="h-4 w-4 text-destructive" />
                            ) : (
                              <ShieldCheck className="h-4 w-4 text-green-600" />
                            )}
                            <span className={user.role === "Admin" ? "font-medium" : ""}>
                              {user.role}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={user.status === "Activo" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {user.lastLogin}
                        </TableCell>
                        <TableCell className="text-right space-x-2 whitespace-nowrap">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditClick(user)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleUserStatus(user.id, user.status)}
                            title={user.status === "Activo" ? "Desactivar" : "Activar"}
                          >
                            {user.status === "Activo" ? "Suspender" : "Activar"}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No se encontraron usuarios.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
