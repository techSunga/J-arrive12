"use client"

import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Truck, Package, MapPin, Shield, Zap, Star, Layout, Users, BarChart3, Clock } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  const services = [
    { title: "Livraison à domicile", description: "Particuliers, e-commerçants et restaurants.", icon: Package, color: "bg-blue-50 text-blue-600" },
    { title: "Stockage des marchandises", description: "Espaces sécurisés pour vos marchandises.", icon: MapPin, color: "bg-orange-50 text-orange-600" },
    { title: "Déménagement", description: "Service professionnel pour vos changements de domicile.", icon: Layout, color: "bg-green-50 text-green-600" },
    { title: "Achat et livraison de gaz", description: "Recharge rapide et achat de votre gaz.", icon: Shield, color: "bg-purple-50 text-purple-600" },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-brand-blue/5 rounded-bl-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-7xl font-extrabold leading-tight mb-6">
                Vos colis arrivent <span className="text-brand-orange">maintenant</span> au Congo.
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                J'ARRIVE est votre partenaire logistique de confiance. Nous sommes un service d'import & export et de livraison à domicile, du transport au stockage !
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-brand-blue h-14 text-lg">Commander maintenant</Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline" className="h-14 text-lg border-brand-blue text-brand-blue">Nos services</Button>
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100" />
                  ))}
                </div>
                <p className="text-sm font-medium text-gray-500">
                  <span className="text-gray-900 font-bold">5000+</span> clients satisfaits au Congo
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-tr from-brand-blue to-brand-orange rounded-3xl opacity-10 animate-pulse absolute inset-0 blur-3xl" />
              <div className="relative bg-white p-4 rounded-3xl shadow-2xl border border-gray-100">
                {/* Visual mockup of tracking */}
                <div className="h-[400px] w-full bg-gray-50 rounded-2xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Brazzaville,Congo&zoom=13&size=600x400')] bg-cover" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="bg-brand-orange p-3 rounded-full shadow-lg"
                    >
                      <Truck className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>
                </div>
                <div className="mt-4 p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">Colis en route</h4>
                    <p className="text-xs text-gray-500">Arrivée estimée dans 15 mins</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-brand-blue">1 500 FCFA</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Nos Services</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Nous offrons une gamme complète de solutions logistiques adaptées à vos besoins, que vous soyez un particulier ou une entreprise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="h-full border border-gray-100 shadow-sm group-hover:shadow-xl transition-all">
                  <CardContent className="pt-8 text-center sm:text-left">
                    <div className={`${service.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto sm:mx-0`}>
                      <service.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interfaces Section */}
      <section className="py-20 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-brand-blue p-8 rounded-3xl text-white relative overflow-hidden group shadow-xl">
              <h3 className="text-2xl font-bold mb-4">Interface Client</h3>
              <p className="mb-6 opacity-80">Commandez vos livraisons, suivez vos colis et gérez vos factures en un clic.</p>
              <Link href="/auth/register">
                <Button className="bg-white text-brand-blue hover:bg-gray-100 border-none">Commencer</Button>
              </Link>
              <Layout className="absolute -bottom-10 -right-10 w-40 h-40 opacity-10 group-hover:scale-110 transition-transform" />
            </div>
            <div className="bg-brand-orange p-8 rounded-3xl text-white relative overflow-hidden group shadow-xl">
              <h3 className="text-2xl font-bold mb-4">Interface Livreur</h3>
              <p className="mb-6 opacity-80">Rejoignez notre équipe de livreurs et commencez à gagner sereinement.</p>
              <Link href="/driver">
                <Button className="bg-white text-brand-orange hover:bg-gray-100 border-none">Devenir Livreur</Button>
              </Link>
              <Truck className="absolute -bottom-10 -right-10 w-40 h-40 opacity-10 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="bg-brand-orange p-1.5 rounded-lg">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-brand-blue italic">J'ARRIVE</span>
          </div>
          <p className="text-gray-500 text-sm mb-6">© 2026 J'ARRIVE Logistique République du Congo. Tous droits réservés.</p>
          <div className="flex justify-center gap-6">
            <Link href="#" className="text-gray-400 hover:text-brand-blue transition-colors text-sm">Conditions</Link>
            <Link href="#" className="text-gray-400 hover:text-brand-blue transition-colors text-sm">Confidentialité</Link>
            <Link href="#" className="text-gray-400 hover:text-brand-blue transition-colors text-sm">Aide</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
