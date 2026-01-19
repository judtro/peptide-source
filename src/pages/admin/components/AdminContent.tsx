import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, FileText, Calendar, Clock, Eye, Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { z } from 'zod';
import { useArticleCategories, ArticleCategoryOption } from '@/hooks/useArticleCategories';

interface DbArticle {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string;
  category_label: string | null;
  published_date: string | null;
  read_time: number | null;
}

interface ArticleFormData {
  title: string;
  summary: string;
  category: string;
  readTime: string;
}

interface GeneratedArticle {
  title: string;
  summary: string;
  slug: string;
  category: string;
  categoryLabel: string;
  isNewCategory?: boolean;
  tableOfContents: Array<{ id: string; title: string; level: number }>;
  content: Array<{
    type: 'heading' | 'paragraph' | 'list' | 'callout';
    id?: string;
    level?: number;
    text?: string;
    items?: string[];
    variant?: 'info' | 'warning' | 'note';
  }>;
  readTime: number;
  relatedPeptides: string[];
  matchedPeptideSlugs?: string[];
}

interface AIGenerationForm {
  keyword: string;
  targetLength: 'short' | 'standard' | 'long';
  additionalContext: string;
}

const emptyFormData: ArticleFormData = {
  title: '',
  summary: '',
  category: 'safety',
  readTime: '5',
};

const emptyAIForm: AIGenerationForm = {
  keyword: '',
  targetLength: 'standard',
  additionalContext: '',
};

const lengthOptions = [
  { value: 'short', label: 'Short (~800-1000 words)' },
  { value: 'standard', label: 'Standard (~1200-1500 words)' },
  { value: 'long', label: 'Long (~2000-2500 words)' },
];

// Fallback categories in case database fetch fails
const fallbackCategories: ArticleCategoryOption[] = [
  { value: 'safety', label: 'Safety' },
  { value: 'handling', label: 'Handling' },
  { value: 'pharmacokinetics', label: 'Pharmacokinetics' },
  { value: 'verification', label: 'Verification' },
  { value: 'sourcing', label: 'Sourcing' },
];

export default function AdminContent() {
  const [articleList, setArticleList] = useState<DbArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<DbArticle | null>(null);
  const [deleteArticle, setDeleteArticle] = useState<DbArticle | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>(emptyFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // AI Generation state
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiForm, setAIForm] = useState<AIGenerationForm>(emptyAIForm);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSavingGenerated, setIsSavingGenerated] = useState(false);

  // Fetch dynamic categories from database
  const { data: dbCategories, refetch: refetchCategories } = useArticleCategories();
  const categories = dbCategories && dbCategories.length > 0 ? dbCategories : fallbackCategories;

  // Create dynamic validation schema based on available categories
  const createArticleSchema = (cats: ArticleCategoryOption[]) => z.object({
    title: z.string()
      .trim()
      .min(1, 'Title is required')
      .max(200, 'Title must be less than 200 characters'),
    summary: z.string()
      .max(500, 'Summary must be less than 500 characters')
      .optional()
      .or(z.literal('')),
    category: z.string().refine(
      val => cats.some(c => c.value === val),
      'Invalid category'
    ),
    readTime: z.string()
      .refine(val => {
        const num = parseInt(val);
        return !isNaN(num) && num >= 1 && num <= 60;
      }, 'Read time must be between 1 and 60 minutes'),
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, slug, title, summary, category, category_label, published_date, read_time')
        .order('published_date', { ascending: false });

      if (error) throw error;
      setArticleList(data || []);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Error fetching articles:', err);
      toast.error('Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (article?: DbArticle) => {
    setFormErrors({});
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        summary: article.summary || '',
        category: article.category,
        readTime: (article.read_time || 5).toString(),
      });
    } else {
      setEditingArticle(null);
      setFormData(emptyFormData);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingArticle(null);
    setFormData(emptyFormData);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const articleSchema = createArticleSchema(categories);
    const result = articleSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSaving(true);

    try {
      const slug = formData.title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 100);
      const categoryLabel = categories.find(c => c.value === formData.category)?.label || formData.category;

      if (editingArticle) {
        const { error } = await supabase
          .from('articles')
          .update({
            title: formData.title.trim(),
            slug,
            summary: formData.summary.trim() || null,
            category: formData.category,
            category_label: categoryLabel,
            read_time: parseInt(formData.readTime),
          })
          .eq('id', editingArticle.id);

        if (error) throw error;
        toast.success(`Article "${formData.title}" updated`);
      } else {
        const { error } = await supabase
          .from('articles')
          .insert({
            title: formData.title.trim(),
            slug,
            summary: formData.summary.trim() || null,
            category: formData.category,
            category_label: categoryLabel,
            read_time: parseInt(formData.readTime),
            published_date: new Date().toISOString(),
          });

        if (error) throw error;
        toast.success(`Article "${formData.title}" created`);
      }

      handleCloseForm();
      fetchArticles();
    } catch (err: any) {
      if (import.meta.env.DEV) console.error('Error saving article:', err);
      toast.error('Failed to save article. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteArticle) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', deleteArticle.id);

      if (error) throw error;
      
      toast.success(`Article "${deleteArticle.title}" deleted`);
      setDeleteArticle(null);
      setIsDeleteOpen(false);
      fetchArticles();
    } catch (err: any) {
      if (import.meta.env.DEV) console.error('Error deleting article:', err);
      toast.error('Failed to delete article. Please try again.');
    }
  };

  // AI Generation handlers
  const handleOpenAIDialog = () => {
    setAIForm(emptyAIForm);
    setIsAIDialogOpen(true);
  };

  const handleGenerateArticle = async () => {
    if (!aiForm.keyword.trim()) {
      toast.error('Please enter a keyword or keyphrase');
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-article', {
        body: {
          keyword: aiForm.keyword.trim(),
          targetLength: aiForm.targetLength,
          additionalContext: aiForm.additionalContext.trim() || undefined,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.article) {
        throw new Error('No article generated');
      }

      setGeneratedArticle(data.article);
      setIsAIDialogOpen(false);
      setIsPreviewOpen(true);
      
      // If a new category was created, refetch categories
      if (data.article.isNewCategory) {
        refetchCategories();
        toast.success(`Article generated with new category: ${data.article.categoryLabel}`);
      } else {
        toast.success('Article generated successfully!');
      }
    } catch (err: any) {
      console.error('Error generating article:', err);
      toast.error(err.message || 'Failed to generate article');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedArticle = async () => {
    if (!generatedArticle) return;

    setIsSavingGenerated(true);

    try {
      const { error } = await supabase
        .from('articles')
        .insert({
          title: generatedArticle.title,
          slug: generatedArticle.slug,
          summary: generatedArticle.summary,
          category: generatedArticle.category,
          category_label: generatedArticle.categoryLabel,
          read_time: generatedArticle.readTime,
          table_of_contents: generatedArticle.tableOfContents,
          content: generatedArticle.content,
          related_peptides: generatedArticle.relatedPeptides,
          published_date: new Date().toISOString(),
          author_name: 'ChemVerify Team',
          author_role: 'Editorial',
        });

      if (error) throw error;

      toast.success(`Article "${generatedArticle.title}" saved!`);
      setIsPreviewOpen(false);
      setGeneratedArticle(null);
      fetchArticles();
    } catch (err: any) {
      console.error('Error saving generated article:', err);
      toast.error('Failed to save article. Please try again.');
    } finally {
      setIsSavingGenerated(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      safety: 'bg-success/10 text-success border-success/30',
      verification: 'bg-primary/10 text-primary border-primary/30',
      handling: 'bg-[hsl(201,96%,50%,0.1)] text-[hsl(201,96%,50%)] border-[hsl(201,96%,50%,0.3)]',
      pharmacokinetics: 'bg-[hsl(280,70%,50%,0.1)] text-[hsl(280,70%,60%)] border-[hsl(280,70%,50%,0.3)]',
      sourcing: 'bg-muted text-muted-foreground border-border',
    };
    return colors[category] || 'bg-muted text-muted-foreground border-border';
  };

  const renderContentPreview = (content: GeneratedArticle['content']) => {
    return content.slice(0, 10).map((block, index) => {
      switch (block.type) {
        case 'heading':
          return (
            <div key={index} className={`font-semibold text-[hsl(210,40%,98%)] ${block.level === 2 ? 'text-lg mt-4' : 'text-base mt-3'}`}>
              {block.text}
            </div>
          );
        case 'paragraph':
          return (
            <p key={index} className="text-[hsl(215,20%,70%)] text-sm mt-2">
              {block.text}
            </p>
          );
        case 'list':
          return (
            <ul key={index} className="list-disc list-inside text-[hsl(215,20%,70%)] text-sm mt-2 space-y-1">
              {block.items?.slice(0, 5).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
              {(block.items?.length || 0) > 5 && (
                <li className="text-[hsl(215,20%,50%)]">... and {(block.items?.length || 0) - 5} more</li>
              )}
            </ul>
          );
        case 'callout':
          return (
            <div
              key={index}
              className={`mt-3 p-3 rounded-md text-sm ${
                block.variant === 'warning'
                  ? 'bg-warning/10 text-warning border border-warning/30'
                  : block.variant === 'note'
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'bg-[hsl(201,96%,50%,0.1)] text-[hsl(201,96%,50%)] border border-[hsl(201,96%,50%,0.3)]'
              }`}
            >
              {block.text}
            </div>
          );
        default:
          return null;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[hsl(210,40%,98%)]">Content Management</h2>
          <p className="text-sm text-[hsl(215,20%,60%)]">Manage educational articles and blog posts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleOpenAIDialog}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate with AI
          </Button>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
        </div>
      </div>

      <Card className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[hsl(215,25%,20%)] hover:bg-transparent">
                <TableHead className="text-[hsl(215,20%,70%)]">Title</TableHead>
                <TableHead className="text-[hsl(215,20%,70%)]">Category</TableHead>
                <TableHead className="text-[hsl(215,20%,70%)]">Published</TableHead>
                <TableHead className="text-[hsl(215,20%,70%)]">Read Time</TableHead>
                <TableHead className="text-[hsl(215,20%,70%)] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articleList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-[hsl(215,20%,60%)]">
                    No articles found. Create your first article to get started.
                  </TableCell>
                </TableRow>
              ) : (
                articleList.map((article) => (
                  <TableRow key={article.id} className="border-[hsl(215,25%,20%)] hover:bg-[hsl(215,25%,15%)]">
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-[hsl(215,20%,50%)] mt-0.5" />
                        <div>
                          <p className="font-medium text-[hsl(210,40%,98%)]">{article.title}</p>
                          <p className="text-xs text-[hsl(215,20%,60%)] line-clamp-1 max-w-md">
                            {article.summary || 'No summary'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCategoryColor(article.category)}>
                        {article.category_label || article.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[hsl(215,20%,70%)]">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {article.published_date ? new Date(article.published_date).toLocaleDateString() : '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-[hsl(215,20%,70%)]">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.read_time || 5} min
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="text-[hsl(215,20%,70%)] hover:text-[hsl(210,40%,98%)] hover:bg-[hsl(215,25%,20%)]"
                        >
                          <a href={`/education/${article.slug}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenForm(article)}
                          className="text-[hsl(215,20%,70%)] hover:text-[hsl(210,40%,98%)] hover:bg-[hsl(215,25%,20%)]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleteArticle(article);
                            setIsDeleteOpen(true);
                          }}
                          className="text-[hsl(215,20%,70%)] hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)] text-[hsl(210,40%,98%)]">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Edit Article' : 'Create New Article'}</DialogTitle>
            <DialogDescription className="text-[hsl(215,20%,60%)]">
              {editingArticle ? 'Update article metadata' : 'Add a new educational article'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Understanding Peptide Stability"
                className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]"
                maxLength={200}
                required
              />
              {formErrors.title && (
                <p className="text-xs text-destructive">{formErrors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief description of the article..."
                className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)] min-h-[100px]"
                maxLength={500}
              />
              {formErrors.summary && (
                <p className="text-xs text-destructive">{formErrors.summary}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
                    {categories.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Read Time (minutes)</Label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.readTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, readTime: e.target.value }))}
                  className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]"
                  required
                />
                {formErrors.readTime && (
                  <p className="text-xs text-destructive">{formErrors.readTime}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : editingArticle ? 'Save Changes' : 'Create Article'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Generation Dialog - No category selection, AI auto-selects */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)] text-[hsl(210,40%,98%)] max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate SEO Article with AI
            </DialogTitle>
            <DialogDescription className="text-[hsl(215,20%,60%)]">
              Enter a keyword — AI will automatically select the best category and identify related peptides
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>SEO Keyword/Keyphrase *</Label>
              <Input
                value={aiForm.keyword}
                onChange={(e) => setAIForm(prev => ({ ...prev, keyword: e.target.value }))}
                placeholder='e.g., "BPC-157 reconstitution guide" or "peptide storage best practices"'
                className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]"
                disabled={isGenerating}
              />
              <p className="text-xs text-[hsl(215,20%,50%)]">
                AI will analyze this and auto-select the best category
              </p>
            </div>

            <div className="space-y-2">
              <Label>Article Length</Label>
              <Select
                value={aiForm.targetLength}
                onValueChange={(value: 'short' | 'standard' | 'long') => setAIForm(prev => ({ ...prev, targetLength: value }))}
                disabled={isGenerating}
              >
                <SelectTrigger className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
                  {lengthOptions.map(l => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Additional Context (optional)</Label>
              <Textarea
                value={aiForm.additionalContext}
                onChange={(e) => setAIForm(prev => ({ ...prev, additionalContext: e.target.value }))}
                placeholder="Any specific points to cover, safety warnings, or focus areas..."
                className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)] min-h-[80px]"
                disabled={isGenerating}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAIDialogOpen(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateArticle}
                disabled={isGenerating || !aiForm.keyword.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Article
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generated Article Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)] text-[hsl(210,40%,98%)] max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Review Generated Article</DialogTitle>
            <DialogDescription className="text-[hsl(215,20%,60%)]">
              Review the AI-generated article before saving
            </DialogDescription>
          </DialogHeader>
          {generatedArticle && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <Label className="text-[hsl(215,20%,60%)]">Title</Label>
                  <p className="text-xl font-semibold text-[hsl(210,40%,98%)]">{generatedArticle.title}</p>
                </div>

                {/* Summary */}
                <div className="space-y-1">
                  <Label className="text-[hsl(215,20%,60%)]">Summary (Meta Description)</Label>
                  <p className="text-sm text-[hsl(215,20%,80%)]">{generatedArticle.summary}</p>
                  <p className="text-xs text-[hsl(215,20%,50%)]">{generatedArticle.summary.length} characters</p>
                </div>

                {/* Metadata - shows auto-selected category */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getCategoryColor(generatedArticle.category)}>
                      {generatedArticle.categoryLabel}
                    </Badge>
                    {generatedArticle.isNewCategory && (
                      <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                        NEW
                      </Badge>
                    )}
                  </div>
                  <span className="text-[hsl(215,20%,60%)] flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {generatedArticle.readTime} min read
                  </span>
                </div>

                {/* Table of Contents */}
                <div className="space-y-2">
                  <Label className="text-[hsl(215,20%,60%)]">Table of Contents</Label>
                  <div className="bg-[hsl(222,47%,7%)] rounded-md p-3 space-y-1">
                    {generatedArticle.tableOfContents.map((item, index) => (
                      <div
                        key={index}
                        className={`text-sm text-[hsl(215,20%,80%)] ${item.level === 3 ? 'ml-4' : ''}`}
                      >
                        • {item.title}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Preview */}
                <div className="space-y-2">
                  <Label className="text-[hsl(215,20%,60%)]">Content Preview</Label>
                  <div className="bg-[hsl(222,47%,7%)] rounded-md p-4">
                    {renderContentPreview(generatedArticle.content)}
                    {generatedArticle.content.length > 10 && (
                      <p className="text-[hsl(215,20%,50%)] text-sm mt-4 italic">
                        ... and {generatedArticle.content.length - 10} more content blocks
                      </p>
                    )}
                  </div>
                </div>

                {/* Related Peptides */}
                {generatedArticle.relatedPeptides.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-[hsl(215,20%,60%)]">Related Peptides (will be clickable links)</Label>
                    <div className="flex flex-wrap gap-2">
                      {generatedArticle.relatedPeptides.map((peptide, index) => (
                        <Badge key={index} variant="secondary" className="bg-[hsl(222,47%,15%)]">
                          {peptide}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-[hsl(215,25%,20%)]">
            <Button
              variant="outline"
              onClick={() => {
                setIsPreviewOpen(false);
                setGeneratedArticle(null);
              }}
              disabled={isSavingGenerated}
            >
              Discard
            </Button>
            <Button
              onClick={handleSaveGeneratedArticle}
              disabled={isSavingGenerated}
            >
              {isSavingGenerated ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Article'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[hsl(210,40%,98%)]">Delete Article?</AlertDialogTitle>
            <AlertDialogDescription className="text-[hsl(215,20%,60%)]">
              This action cannot be undone. This will permanently delete{' '}
              <strong className="text-[hsl(210,40%,98%)]">"{deleteArticle?.title}"</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[hsl(215,25%,25%)] text-[hsl(210,40%,98%)] hover:bg-[hsl(215,25%,17%)]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
