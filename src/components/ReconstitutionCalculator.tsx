import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Beaker, Droplets } from 'lucide-react';

export const ReconstitutionCalculator = () => {
  const { t } = useTranslation();
  const [peptideAmount, setPeptideAmount] = useState(5);
  const [waterVolume, setWaterVolume] = useState(2);
  const [concentration, setConcentration] = useState(0);

  useEffect(() => {
    // Calculate mcg per 0.1ml (10 units on insulin syringe)
    if (waterVolume > 0) {
      const totalMcg = peptideAmount * 1000; // Convert mg to mcg
      const mcgPerMl = totalMcg / waterVolume;
      const mcgPer01ml = mcgPerMl * 0.1; // Per 10 units
      setConcentration(Math.round(mcgPer01ml * 100) / 100);
    }
  }, [peptideAmount, waterVolume]);

  // Calculate fill percentage for syringe visual (0-100%)
  const fillPercentage = Math.min((concentration / 500) * 100, 100);

  return (
    <Card className="overflow-hidden border-border">
      <CardHeader className="bg-secondary/10">
        <CardTitle className="flex items-center gap-2">
          <Beaker className="h-5 w-5 text-primary" />
          {t('calculator.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Controls */}
          <div className="space-y-8">
            {/* Peptide Amount */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{t('calculator.peptideAmount')}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={peptideAmount}
                    onChange={(e) => setPeptideAmount(Number(e.target.value) || 0)}
                    className="h-8 w-20 font-mono text-right"
                    min={0.1}
                    max={50}
                    step={0.1}
                  />
                  <span className="text-sm text-muted-foreground">mg</span>
                </div>
              </div>
              <Slider
                value={[peptideAmount]}
                onValueChange={([val]) => setPeptideAmount(val)}
                min={0.1}
                max={50}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Water Volume */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Droplets className="h-4 w-4 text-primary" />
                  {t('calculator.waterVolume')}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={waterVolume}
                    onChange={(e) => setWaterVolume(Number(e.target.value) || 0)}
                    className="h-8 w-20 font-mono text-right"
                    min={0.5}
                    max={10}
                    step={0.5}
                  />
                  <span className="text-sm text-muted-foreground">ml</span>
                </div>
              </div>
              <Slider
                value={[waterVolume]}
                onValueChange={([val]) => setWaterVolume(val)}
                min={0.5}
                max={10}
                step={0.5}
                className="w-full"
              />
            </div>
          </div>

          {/* Result Display - LCD Style */}
          <div className="flex flex-col items-center justify-center gap-6">
            {/* Syringe Visual */}
            <div className="relative h-48 w-12">
              <svg viewBox="0 0 48 200" className="h-full w-full">
                {/* Syringe body */}
                <rect
                  x="8"
                  y="20"
                  width="32"
                  height="140"
                  rx="2"
                  className="fill-muted stroke-border"
                  strokeWidth="2"
                />
                {/* Needle */}
                <rect x="20" y="160" width="8" height="30" className="fill-muted-foreground" />
                <polygon points="24,200 18,190 30,190" className="fill-muted-foreground" />
                {/* Plunger */}
                <rect x="16" y="0" width="16" height="24" rx="2" className="fill-secondary" />
                {/* Fill level */}
                <rect
                  x="10"
                  y={158 - fillPercentage * 1.36}
                  width="28"
                  height={fillPercentage * 1.36}
                  className="fill-primary/60"
                />
                {/* Graduation marks */}
                {[0, 25, 50, 75, 100].map((mark) => (
                  <g key={mark}>
                    <line
                      x1="40"
                      y1={158 - mark * 1.36}
                      x2="46"
                      y2={158 - mark * 1.36}
                      className="stroke-foreground"
                      strokeWidth="1"
                    />
                    <text
                      x="46"
                      y={162 - mark * 1.36}
                      className="fill-muted-foreground text-[8px]"
                    >
                      {mark}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* LCD Display */}
            <div className="relative w-full overflow-hidden rounded-lg bg-lcd-background p-6 scanlines">
              <div className="text-center">
                <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {t('calculator.result')}
                </p>
                <div className="lcd-display text-4xl font-bold text-lcd-glow md:text-5xl">
                  {concentration.toFixed(1)}
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  mcg {t('calculator.perUnit')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
