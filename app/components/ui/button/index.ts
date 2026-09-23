import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

// Klaris restyle of the shadcn button: tight radius, mint as the only filled
// accent, gold reserved for VIP actions.
export const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out-quint active:translate-y-px disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
  {
    variants: {
      variant: {
        default:
          "bg-brand-500 text-brand-950 hover:bg-brand-400 hover:shadow-brand",
        destructive:
          "bg-red-k/12 text-red-k border border-red-k/35 hover:bg-red-k/20 hover:border-red-k/60",
        outline:
          "border border-white/12 bg-white/[.02] text-foreground hover:border-brand-500/50 hover:bg-brand-500/[.06] hover:text-brand-300",
        secondary:
          "bg-ink-700 text-foreground border border-white/6 hover:bg-ink-600",
        ghost:
          "text-muted-foreground hover:bg-white/5 hover:text-foreground",
        link: "text-brand-400 underline-offset-4 hover:underline",
        vip:
          "bg-gold-k text-[#1a1203] hover:brightness-110 hover:shadow-[0_8px_28px_-8px_rgb(245_180_61/.55)]",
      },
      size: {
        "default": "h-10 px-4 has-[>svg]:px-3.5",
        "xs": "h-7 gap-1 rounded-sm px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        "sm": "h-8 gap-1.5 px-3 text-[13px] has-[>svg]:px-2.5",
        "lg": "h-12 px-6 text-[15px] has-[>svg]:px-5",
        "icon": "size-10",
        "icon-xs": "size-7 rounded-sm [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
