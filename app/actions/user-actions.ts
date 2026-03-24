"use server"

import { supabaseAdmin } from "@/lib/supabase-admin"

export async function fetchUsers() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  
  if (error) {
    console.error("Error fetching users:", error)
    return { error: error.message }
  }
  
  const users = data.users.map(u => ({
    id: u.id,
    name: u.user_metadata?.name || u.email?.split('@')[0] || "Usuario",
    email: u.email || "",
    role: (u.user_metadata?.role as "Admin" | "Usuario") || "Usuario",
    status: (u.user_metadata?.status as "Activo" | "Inactivo") || "Activo",
    lastLogin: u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('es-CO') : "Nunca",
  }))

  return { users }
}

export async function createUser(userData: { email: string; name: string; role: "Admin" | "Usuario"; password?: string }) {
  // Use user provided password or a secure temporary random string if not provided
  const tempPassword = userData.password || (Math.random().toString(36).slice(-10) + "A1!")
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: userData.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      name: userData.name,
      role: userData.role,
      status: "Activo"
    }
  })
  
  // Note: the admin could optionally send a password reset mail directly
  if (!error && data.user) {
    await supabaseAdmin.auth.admin.inviteUserByEmail(userData.email, {
      data: {
        name: userData.name,
        role: userData.role,
        status: "Activo"
      }
    }); // This sends an email invitation. Note that if user is created using createUser first, they will be given the random password.
  }

  if (error) {
    console.error("Error creating user:", error)
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteUser(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  
  if (error) {
    console.error("Error deleting user:", error)
    return { error: error.message }
  }
  
  return { success: true }
}

export async function toggleUserStatusAction(userId: string, currentStatus: "Activo" | "Inactivo") {
  const newStatus = currentStatus === "Activo" ? "Inactivo" : "Activo"
  
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { status: newStatus },
    // A quick way to "suspend" is technically not natively provided easily other than ban, 
    // but we can ban them physically or keep it handled via metadata status in login router.
    ban_duration: newStatus === "Inactivo" ? "87600h" : "none" // Ban for 10 years if inactive
  })
  
  if (error) {
    console.error("Error toggling user status:", error)
    return { error: error.message }
  }
  
  return { success: true, newStatus }
}

export async function updateUser(userId: string, data: { name: string; role: "Admin" | "Usuario"; password?: string; currentStatus: "Activo" | "Inactivo" }) {
  const updatePayload: any = {
    user_metadata: {
      name: data.name,
      role: data.role,
      status: data.currentStatus // preserve existing status
    }
  }
  
  if (data.password && data.password.trim().length >= 6) {
    updatePayload.password = data.password.trim()
  }
  
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, updatePayload)
  
  if (error) {
    console.error("Error updating user:", error)
    return { error: error.message }
  }
  
  return { success: true }
}
