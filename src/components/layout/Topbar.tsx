'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MESSAGES = [
  "📦 Frete Grátis acima de R$ 199 (Pix) ou R$ 299 (Cartão)!",
  "📏 Na dúvida sobre o tamanho? Use nosso Provador Virtual!",
  "💳 Parcele suas compras em até 12x"
]

export default function Topbar() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-[var(--color-brand-green-deep)] text-[var(--color-brand-ivory)] py-2 px-4 text-[11px] font-medium tracking-[0.08em] overflow-hidden relative">
      <div className="container mx-auto flex justify-center md:justify-between items-center gap-2 h-5">
        
        <div className="w-full text-center md:text-left flex-1 relative h-full flex items-center justify-center md:justify-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="absolute w-full truncate"
            >
              {MESSAGES[index]}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hidden md:flex items-center justify-end gap-2 flex-1 text-[var(--color-brand-ivory)]/70">
          <span>WhatsApp Oficial:</span>
          <span className="font-bold text-[var(--color-brand-ivory)]">(21) 97859-4358</span>
        </div>
      </div>
    </div>
  )
}

