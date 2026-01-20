import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Loader2, Play, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface Schedule {
  id: string;
  is_active: boolean;
  frequency: 'daily' | 'weekly';
  day_of_week: number | null;
  time_of_day: string;
  target_length: 'short' | 'standard' | 'long';
  additional_context: string | null;
  last_run_at: string | null;
  next_run_at: string | null;
}

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const lengthOptions = [
  { value: 'short', label: 'Short (~800-1000 words)' },
  { value: 'standard', label: 'Standard (~1200-1500 words)' },
  { value: 'long', label: 'Long (~2000-2500 words)' },
];

export function ArticleScheduler() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state
  const [isActive, setIsActive] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('weekly');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [timeOfDay, setTimeOfDay] = useState('09:00');
  const [targetLength, setTargetLength] = useState<'short' | 'standard' | 'long'>('standard');
  const [additionalContext, setAdditionalContext] = useState('');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('article_schedules')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const s = data as Schedule;
        setSchedule(s);
        setIsActive(s.is_active);
        setFrequency(s.frequency);
        setDayOfWeek(s.day_of_week ?? 1);
        setTimeOfDay(s.time_of_day?.substring(0, 5) || '09:00');
        setTargetLength(s.target_length as 'short' | 'standard' | 'long');
        setAdditionalContext(s.additional_context || '');
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const scheduleData = {
        is_active: isActive,
        frequency,
        day_of_week: frequency === 'weekly' ? dayOfWeek : null,
        time_of_day: timeOfDay + ':00',
        target_length: targetLength,
        additional_context: additionalContext.trim() || null,
      };

      if (schedule) {
        // Update existing
        const { error } = await supabase
          .from('article_schedules')
          .update(scheduleData)
          .eq('id', schedule.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('article_schedules')
          .insert(scheduleData);

        if (error) throw error;
      }

      toast.success('Schedule saved successfully');
      fetchSchedule();
    } catch (err: any) {
      console.error('Error saving schedule:', err);
      toast.error('Failed to save schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateNow = async () => {
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('auto-generate-article', {
        body: { forceGenerate: true },
      });

      if (error) throw error;

      if (data?.success && data?.generated) {
        toast.success(`Article generated: "${data.article.title}"`);
        fetchSchedule();
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        toast.info('No article generated');
      }
    } catch (err: any) {
      console.error('Error generating article:', err);
      toast.error(err.message || 'Failed to generate article');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[hsl(210,40%,98%)] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Automatic Article Generation
            </CardTitle>
            <CardDescription className="text-[hsl(215,20%,60%)]">
              Schedule AI to automatically create and publish SEO-optimized articles
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="schedule-active" className="text-[hsl(215,20%,70%)]">
              {isActive ? 'Active' : 'Inactive'}
            </Label>
            <Switch
              id="schedule-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status badges */}
        {schedule && (
          <div className="flex flex-wrap gap-3 pb-4 border-b border-[hsl(215,25%,20%)]">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[hsl(215,20%,50%)]" />
              <span className="text-sm text-[hsl(215,20%,70%)]">Last run:</span>
              <Badge variant="outline" className="text-[hsl(210,40%,98%)]">
                {formatDate(schedule.last_run_at)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[hsl(215,20%,50%)]" />
              <span className="text-sm text-[hsl(215,20%,70%)]">Next run:</span>
              <Badge variant="outline" className={isActive ? 'text-primary border-primary/30' : 'text-[hsl(210,40%,98%)]'}>
                {isActive ? formatDate(schedule.next_run_at) : 'Disabled'}
              </Badge>
            </div>
          </div>
        )}

        {/* Settings grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Frequency */}
          <div className="space-y-2">
            <Label className="text-[hsl(210,40%,98%)]">Frequency</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as 'daily' | 'weekly')}>
              <SelectTrigger className="bg-[hsl(215,25%,15%)] border-[hsl(215,25%,25%)] text-[hsl(210,40%,98%)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Day of week (only for weekly) */}
          {frequency === 'weekly' && (
            <div className="space-y-2">
              <Label className="text-[hsl(210,40%,98%)]">Day of Week</Label>
              <Select value={dayOfWeek.toString()} onValueChange={(v) => setDayOfWeek(parseInt(v))}>
                <SelectTrigger className="bg-[hsl(215,25%,15%)] border-[hsl(215,25%,25%)] text-[hsl(210,40%,98%)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Time of day */}
          <div className="space-y-2">
            <Label className="text-[hsl(210,40%,98%)]">Time (UTC)</Label>
            <Input
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="bg-[hsl(215,25%,15%)] border-[hsl(215,25%,25%)]"
            />
          </div>

          {/* Article length */}
          <div className="space-y-2">
            <Label className="text-[hsl(210,40%,98%)]">Article Length</Label>
            <Select value={targetLength} onValueChange={(v) => setTargetLength(v as 'short' | 'standard' | 'long')}>
              <SelectTrigger className="bg-[hsl(215,25%,15%)] border-[hsl(215,25%,25%)] text-[hsl(210,40%,98%)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lengthOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Additional context */}
        <div className="space-y-2">
          <Label className="text-[hsl(210,40%,98%)]">Topic Guidelines (Optional)</Label>
          <Textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="E.g., 'Focus on safety protocols', 'Target beginners', 'Cover European regulations'..."
            className="bg-[hsl(215,25%,15%)] border-[hsl(215,25%,25%)] min-h-[80px]"
          />
          <p className="text-xs text-[hsl(215,20%,50%)]">
            AI will consider these guidelines when selecting topics and writing articles
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[hsl(215,25%,20%)]">
          <Button
            variant="outline"
            onClick={handleGenerateNow}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Generate Now
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={fetchSchedule}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Schedule
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
