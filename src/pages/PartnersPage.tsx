import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  ShieldCheck, 
  Link2, 
  FileCheck, 
  Search, 
  CheckCircle2,
  ArrowRight,
  Users,
  BarChart3,
  Award,
  XCircle,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

const PartnersPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    companyUrl: '',
    telegramId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.companyUrl.trim()) {
      toast.error(t('partners.form.error_required'));
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success(t('partners.form.success'));
      setFormData({ name: '', companyUrl: '', telegramId: '' });
      setIsSubmitting(false);
    }, 1500);
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: t('partners.benefits.traffic.title'),
      description: t('partners.benefits.traffic.description')
    },
    {
      icon: Award,
      title: t('partners.benefits.badge.title'),
      description: t('partners.benefits.badge.description')
    },
    {
      icon: Link2,
      title: t('partners.benefits.seo.title'),
      description: t('partners.benefits.seo.description')
    }
  ];

  const steps = [
    {
      step: 1,
      icon: FileCheck,
      title: t('partners.process.step1.title'),
      description: t('partners.process.step1.description')
    },
    {
      step: 2,
      icon: Search,
      title: t('partners.process.step2.title'),
      description: t('partners.process.step2.description')
    },
    {
      step: 3,
      icon: CheckCircle2,
      title: t('partners.process.step3.title'),
      description: t('partners.process.step3.description')
    }
  ];

  return (
    <Layout
      title="For Vendors - ChemVerify Partner Program"
      description="Join the ChemVerify verified network. Turn transparency into revenue with 100k+ monthly researchers choosing their suppliers through our platform."
    >
      {/* Hero Section */}
      <section className="relative min-h-[70vh] overflow-hidden border-b border-border bg-slate-950">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Gradient Orbs */}
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        
        <div className="container relative z-10 mx-auto flex min-h-[70vh] items-center px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 font-mono text-xs text-cyan-400">
              {t('partners.hero.badge')}
            </Badge>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {t('partners.hero.title')}
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 md:text-xl">
              {t('partners.hero.subtitle')}
            </p>
            
            <Button 
              size="lg" 
              className="gap-2 bg-cyan-500 px-8 py-6 text-base font-semibold text-slate-950 hover:bg-cyan-400"
              onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('partners.hero.cta')}
              <ArrowRight className="h-5 w-5" />
            </Button>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white md:text-4xl">100k+</div>
                <div className="mt-1 text-sm text-slate-500">{t('partners.stats.researchers')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white md:text-4xl">85%</div>
                <div className="mt-1 text-sm text-slate-500">{t('partners.stats.conversion')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white md:text-4xl">DA 45+</div>
                <div className="mt-1 text-sm text-slate-500">{t('partners.stats.domain')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="border-b border-border bg-slate-900 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              {t('partners.problem.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-slate-400">
              {t('partners.problem.subtitle')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Unverified Vendor */}
            <Card className="border-red-500/20 bg-slate-800/50">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                    <XCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{t('partners.problem.unverified.title')}</h3>
                    <p className="text-sm text-slate-500">{t('partners.problem.unverified.subtitle')}</p>
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500/70" />
                    {t('partners.problem.unverified.point1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500/70" />
                    {t('partners.problem.unverified.point2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500/70" />
                    {t('partners.problem.unverified.point3')}
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Verified Partner */}
            <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-800/50 to-cyan-950/30">
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">
                    <ShieldCheck className="h-6 w-6 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{t('partners.problem.verified.title')}</h3>
                    <Badge className="border-cyan-500/30 bg-cyan-500/10 text-xs text-cyan-400">
                      {t('partners.problem.verified.badge')}
                    </Badge>
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                    {t('partners.problem.verified.point1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                    {t('partners.problem.verified.point2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-500" />
                    {t('partners.problem.verified.point3')}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="border-b border-border bg-slate-950 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              {t('partners.benefits.title')}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="border-slate-800 bg-slate-900/50 transition-all hover:border-cyan-500/30 hover:bg-slate-900"
              >
                <CardContent className="p-8">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                    <benefit.icon className="h-7 w-7 text-cyan-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{benefit.title}</h3>
                  <p className="text-sm text-slate-400">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The Process */}
      <section className="border-b border-border bg-slate-900 py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              {t('partners.process.title')}
            </h2>
            <p className="text-slate-400">{t('partners.process.subtitle')}</p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-cyan-500/50 via-cyan-500/20 to-transparent md:block" />

            <div className="space-y-8 md:space-y-0">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`relative flex flex-col items-center gap-6 md:flex-row ${
                    index % 2 === 1 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Step Number */}
                  <div className="flex flex-1 justify-center md:justify-end">
                    <div className={`w-full max-w-xs ${index % 2 === 1 ? 'md:text-left' : 'md:text-right'}`}>
                      <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
                        <step.icon className="mb-3 h-8 w-8 text-cyan-400" />
                        <h3 className="mb-2 font-semibold text-white">{step.title}</h3>
                        <p className="text-sm text-slate-400">{step.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Center Circle */}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-cyan-500 bg-slate-950 font-mono text-lg font-bold text-cyan-400">
                    {step.step}
                  </div>

                  {/* Empty space for alignment */}
                  <div className="hidden flex-1 md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply-form" className="bg-slate-950 py-20">
        <div className="container mx-auto max-w-xl px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              {t('partners.form.title')}
            </h2>
            <p className="text-slate-400">{t('partners.form.subtitle')}</p>
          </div>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">
                    {t('partners.form.name_label')} *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('partners.form.name_placeholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyUrl" className="text-slate-300">
                    {t('partners.form.url_label')} *
                  </Label>
                  <Input
                    id="companyUrl"
                    type="url"
                    placeholder={t('partners.form.url_placeholder')}
                    value={formData.companyUrl}
                    onChange={(e) => setFormData({ ...formData, companyUrl: e.target.value })}
                    className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegramId" className="text-slate-300">
                    {t('partners.form.telegram_label')}
                  </Label>
                  <Input
                    id="telegramId"
                    type="text"
                    placeholder={t('partners.form.telegram_placeholder')}
                    value={formData.telegramId}
                    onChange={(e) => setFormData({ ...formData, telegramId: e.target.value })}
                    className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full gap-2 bg-cyan-500 py-6 text-base font-semibold text-slate-950 hover:bg-cyan-400"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('common.loading') : t('partners.form.submit')}
                  <Send className="h-5 w-5" />
                </Button>

                <p className="text-center text-xs text-slate-500">
                  {t('partners.form.privacy_note')}
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default PartnersPage;
