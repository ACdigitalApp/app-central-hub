import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Supabase auto-handles the recovery token in the URL fragment.
    // We just need to confirm a session is present.
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
    };
    check();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setHasSession(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: 'Password troppo corta', description: 'Almeno 6 caratteri.', variant: 'destructive' });
      return;
    }
    if (password !== confirm) {
      toast({ title: 'Le password non coincidono', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({
          title: 'Errore',
          description: error.message.includes('session') || error.message.includes('Auth')
            ? 'Link scaduto o sessione mancante. Richiedi un nuovo link.'
            : error.message,
          variant: 'destructive',
        });
        return;
      }
      setSuccess(true);
      toast({ title: 'Password aggiornata!', description: 'Ora puoi accedere con la nuova password.' });
      await supabase.auth.signOut();
      setTimeout(() => navigate('/auth'), 1500);
    } finally {
      setLoading(false);
    }
  };

  if (hasSession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center shadow-card">
          <h1 className="text-2xl font-bold text-foreground mb-2">Link non valido</h1>
          <p className="text-muted-foreground mb-6">
            Il link è scaduto o non è valido. Richiedi un nuovo link di reset password.
          </p>
          <Button onClick={() => navigate('/auth')} className="w-full gradient-primary text-primary-foreground">
            Vai al login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 shadow-card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              {success ? (
                <CheckCircle2 className="w-8 h-8 text-primary" />
              ) : (
                <Lock className="w-8 h-8 text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {success ? 'Password aggiornata' : 'Nuova password'}
            </h1>
            <p className="text-muted-foreground">
              {success ? 'Verrai reindirizzato al login...' : 'Inserisci la tua nuova password.'}
            </p>
          </div>

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="password" className="text-foreground">Nuova password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm" className="text-foreground">Conferma password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-primary-foreground hover:opacity-90"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Aggiorna password<ArrowRight className="w-5 h-5 ml-2" /></>
                )}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
