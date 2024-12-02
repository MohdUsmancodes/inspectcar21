import React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import PropTypes from "prop-types"

import { cn } from "./utils"

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))




const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))

AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

Avatar.propTypes = {
  className: PropTypes.string
}



AvatarFallback.propTypes = {
  className: PropTypes.string
}

export { Avatar, AvatarFallback }