"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AvatarGroupProps {
  users: Array<{
    id: string
    name: string
    email: string
    avatar?: string
  }>
  max?: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function AvatarGroup({ users, max = 4, size = "sm", className }: AvatarGroupProps) {
  const displayedUsers = users.slice(0, 3)
  const remainingCount = users.length - 3

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-8 w-8", 
    lg: "h-10 w-10"
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  return (
    <div className={cn("flex -space-x-2", className)}>
      {displayedUsers.map((user, index) => (
        <Avatar 
          key={user.id} 
          className={cn(
            sizeClasses[size],
            "border-2 border-background hover:z-10 transition-transform hover:scale-110"
          )}
        >
          <AvatarImage 
            src={user.avatar || `/placeholder-user.jpg`} 
            alt={user.name} 
          />
          <AvatarFallback className={cn(textSizeClasses[size], "bg-primary/10")}>
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      <Avatar 
        className={cn(
          sizeClasses[size],
          "border-2 border-background bg-muted hover:z-10 transition-transform hover:scale-110"
        )}
      >
        <AvatarFallback className={cn(textSizeClasses[size], "bg-muted text-muted-foreground")}>
          +{remainingCount > 0 ? remainingCount : 1}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}
