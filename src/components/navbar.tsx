"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { Truck, MapPin, Package, Phone, Menu, X } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Chatbot from "./chatbot"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-brand-orange p-1.5 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent italic tracking-tight">
                J'ARRIVE
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/services" className="text-sm font-semibold text-slate-600 hover:text-brand-orange transition-colors">Services</Link>
            <Link href="/tarifs" className="text-sm font-semibold text-slate-600 hover:text-brand-orange transition-colors">Tarifs</Link>
            <Link href="/suivi" className="text-sm font-semibold text-slate-600 hover:text-brand-orange transition-colors">Suivi</Link>
            <Link href="/contact" className="text-sm font-semibold text-slate-600 hover:text-brand-orange transition-colors">Contact</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Chatbot asNavbarItem />
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="font-bold text-slate-600">Connexion</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold px-6 shadow-md shadow-brand-blue/20">S'inscrire</Button>
            </Link>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-gray-100 px-4 py-8 shadow-2xl"
          >
            <div className="flex flex-col gap-6">
              <Link href="/services" className="text-lg font-bold text-slate-900 px-2">Services</Link>
              <Link href="/tarifs" className="text-lg font-bold text-slate-900 px-2">Tarifs</Link>
              <Link href="/suivi" className="text-lg font-bold text-slate-900 px-2">Suivi</Link>
              <Link href="/contact" className="text-lg font-bold text-slate-900 px-2">Contact</Link>
              <div className="px-2">
                 <Chatbot asNavbarItem />
              </div>
              <hr className="border-gray-100" />
              <div className="flex flex-col gap-4">
                <Link href="/auth/login" className="w-full">
                  <Button variant="outline" className="w-full text-brand-blue border-brand-blue font-bold h-12">Connexion</Button>
                </Link>
                <Link href="/auth/register" className="w-full">
                  <Button className="w-full bg-brand-blue font-bold h-12 shadow-lg shadow-brand-blue/20">S'inscrire</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
