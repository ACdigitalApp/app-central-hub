import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Bell, TrendingUp, Smartphone, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PWAInstallButton } from '@/components/PWAInstallButton';
import { SEO } from '@/components/SEO';
import euroNote from '@/assets/100-euro-note.png';
import euroCoin from '@/assets/2-euro-coin.png';

const FAQS = [
  { q: 'Cos\u2019\u00e8 Gestione Scadenze?', a: 'Gestione Scadenze \u00e8 un\u2019app per organizzare scadenze, pagamenti, bollette, rate, abbonamenti e promemoria personali.' },
  { q: 'Posso usare Gestione Scadenze da smartphone?', a: 'S\u00ec. L\u2019app funziona da browser ed \u00e8 installabile come PWA su smartphone e desktop.' },
  { q: 'Gestione Scadenze serve solo per le bollette?', a: 'No. Pu\u00f2 essere usata anche per rate, documenti, assicurazioni, abbonamenti, entrate, uscite e promemoria personali.' },
  { q: '\u00c8 necessario scaricare l\u2019app da App Store?', a: 'No. Gestione Scadenze \u00e8 una web app installabile direttamente dal browser, senza passare dallo store.' },
  { q: 'I dati sono protetti?', a: 'S\u00ec. L\u2019accesso avviene tramite account personale e i dati sono associati al profilo dell\u2019utente.' },
  { q: 'Posso registrare entrate e uscite?', a: 'S\u00ec. L\u2019app permette di registrare transazioni, controllare il saldo e monitorare entrate e uscite.' },
];

const SITE_URL = 'https://gestionescadenze.app';
const PAGE_URL = 'https://gestionescadenze.app/landing';

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AC Digital App',
    url: SITE_URL,
    email: 'acdigital.app@gmail.com',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Gestione Scadenze',
    url: SITE_URL,
    inLanguage: 'it-IT',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Gestione Scadenze',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web, PWA, Desktop, Mobile',
    inLanguage: 'it-IT',
    url: SITE_URL,
    brand: { '@type': 'Brand', name: 'AC Digital App' },
    publisher: { '@type': 'Organization', name: 'AC Digital App' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
      { '@type': 'ListItem', position: 2, name: 'Landing', item: PAGE_URL },
    ],
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <SEO
        title="Gestione Scadenze | App per Scadenze, Pagamenti e Promemoria"
        description="Gestione Scadenze \u00e8 l\u2019app per organizzare bollette, pagamenti, rate, abbonamenti, entrate, uscite e promemoria personali da desktop e smartphone."
        canonical={PAGE_URL}
        ogImage="https://gestionescadenze.app/pwa-512x512.png"
        jsonLd={JSON_LD}
      />
      {/* Header */}
      <header className="p-4 md:p-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-baseline gap-2">
          <div className="coin-container self-center">
            <div className="banknote-shine coin-rotate w-10 h-10 rounded-full">
              <img src={euroCoin} alt="Euro" className="w-10 h-10 object-contain" />
            </div>
          </div>
          <span className="font-bold text-xl text-foreground">Gestione Scadenze</span>
          <a
            href="mailto:acdigital.app@gmail.com"
            className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
            aria-label="Contatta AC Digital App via email"
          >
            by AC Digital App
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm">Accedi</Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow">
              Inizia Gratis
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="px-4 md:px-6 py-12 md:py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Gestisci le tue <span className="text-primary">finanze</span> in modo semplice
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Tieni traccia di transazioni, scadenze e promemoria. 
            Ricevi notifiche e mantieni il controllo del tuo budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow w-full sm:w-auto">
                Registrati Gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <PWAInstallButton 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto"
            />
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          <Card className="shadow-card border-primary/20 bg-card/50 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Transazioni</h3>
              <p className="text-muted-foreground text-sm">
                Registra entrate e uscite, categorizza le spese e visualizza report dettagliati
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-primary/20 bg-card/50 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Promemoria</h3>
              <p className="text-muted-foreground text-sm">
                Non dimenticare mai una scadenza con promemoria personalizzati e notifiche
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-primary/20 bg-card/50 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Sicuro</h3>
              <p className="text-muted-foreground text-sm">
                I tuoi dati sono protetti e sincronizzati in cloud su tutti i dispositivi
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* PWA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 md:p-12 mb-16"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium text-primary uppercase tracking-wide">App Installabile</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Installa l'app sul tuo dispositivo
              </h2>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-income" />
                  Funziona offline
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-income" />
                  Accesso rapido dalla home screen
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-income" />
                  Notifiche push (Android/Desktop)
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-income" />
                  Nessun download da App Store
                </li>
              </ul>
              <Link to="/install">
                <Button className="gradient-primary text-primary-foreground shadow-glow">
                  <Download className="mr-2 w-5 h-5" />
                  Come Installare
                </Button>
              </Link>
            </div>
            <div className="flex-shrink-0 banknote-container">
              <motion.div 
                className="w-72 h-44 flex items-center justify-center p-3"
                animate={{ 
                  y: [0, -15, 0, -8, 0],
                  rotateX: [0, 5, 0, -5, 0],
                  rotateY: [0, 15, 0, -15, 0],
                  rotateZ: [-2, 2, -2],
                  scale: [1, 1.02, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="banknote-shine w-full h-full rounded-lg">
                  <img src={euroNote} alt="100 Euro" className="w-full h-full object-contain drop-shadow-2xl" />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Pronto a iniziare?
          </h2>
          <p className="text-muted-foreground mb-6">
            Registrati gratuitamente e inizia a gestire le tue finanze oggi stesso
          </p>
          <Link to="/auth">
            <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
              Crea Account Gratuito
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-muted-foreground text-sm border-t border-border/50 mt-12">
        <p>
          © 2024 Gestione Scadenze{' '}
          <a
            href="mailto:acdigital.app@gmail.com"
            className="text-xs font-medium hover:text-primary transition-colors underline-offset-2 hover:underline align-bottom"
            aria-label="Contatta AC Digital App via email"
          >
            by AC Digital App
          </a>
          . Tutti i diritti riservati.
        </p>
        <p className="mt-2">
          PWA disponibile su iOS, Android, Windows e Mac
        </p>
      </footer>
    </div>
  );
}
