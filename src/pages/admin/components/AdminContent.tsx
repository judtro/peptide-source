import { useState } from 'react';
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
import { articles as initialArticles } from '@/data/articles';
import { Plus, Pencil, Trash2, FileText, Calendar, Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  publishedDate: string;
  readTime: number;
}

interface ArticleFormData {
  title: string;
  summary: string;
  category: string;
  readTime: string;
}

const emptyFormData: ArticleFormData = {
  title: '',
  summary: '',
  category: 'Safety',
  readTime: '5',
};

const categories = ['Safety', 'Science', 'Legal', 'Handling', 'Pharmacokinetics', 'Sourcing'];

export default function AdminContent() {
  const [articleList, setArticleList] = useState<ArticleItem[]>(
    initialArticles.map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      summary: a.summary,
      category: a.categoryLabel || a.category,
      publishedDate: a.publishedDate,
      readTime: a.readTime,
    }))
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [deleteArticle, setDeleteArticle] = useState<ArticleItem | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>(emptyFormData);

  const handleOpenForm = (article?: ArticleItem) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        summary: article.summary,
        category: article.category,
        readTime: article.readTime.toString(),
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingArticle) {
      setArticleList(prev =>
        prev.map(a =>
          a.id === editingArticle.id
            ? {
                ...a,
                title: formData.title,
                summary: formData.summary,
                category: formData.category,
                readTime: parseInt(formData.readTime),
              }
            : a
        )
      );
      toast.success(`Article "${formData.title}" updated`);
    } else {
      const newArticle: ArticleItem = {
        id: `article-${Date.now()}`,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        title: formData.title,
        summary: formData.summary,
        category: formData.category,
        publishedDate: new Date().toISOString().split('T')[0],
        readTime: parseInt(formData.readTime),
      };
      setArticleList(prev => [newArticle, ...prev]);
      toast.success(`Article "${formData.title}" created`);
    }
    handleCloseForm();
  };

  const handleDelete = () => {
    if (deleteArticle) {
      setArticleList(prev => prev.filter(a => a.id !== deleteArticle.id));
      toast.success(`Article "${deleteArticle.title}" deleted`);
      setDeleteArticle(null);
      setIsDeleteOpen(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Safety: 'bg-success/10 text-success border-success/30',
      Science: 'bg-primary/10 text-primary border-primary/30',
      Legal: 'bg-[hsl(45,93%,47%,0.1)] text-[hsl(45,93%,47%)] border-[hsl(45,93%,47%,0.3)]',
      Handling: 'bg-[hsl(201,96%,50%,0.1)] text-[hsl(201,96%,50%)] border-[hsl(201,96%,50%,0.3)]',
      Pharmacokinetics: 'bg-[hsl(280,70%,50%,0.1)] text-[hsl(280,70%,60%)] border-[hsl(280,70%,50%,0.3)]',
      Sourcing: 'bg-muted text-muted-foreground border-border',
    };
    return colors[category] || colors.Sourcing;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[hsl(210,40%,98%)]">Content Management</h2>
          <p className="text-sm text-[hsl(215,20%,60%)]">Manage educational articles and blog posts</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Button>
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
              {articleList.map((article) => (
                <TableRow key={article.id} className="border-[hsl(215,25%,20%)] hover:bg-[hsl(215,25%,15%)]">
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-[hsl(215,20%,50%)] mt-0.5" />
                      <div>
                        <p className="font-medium text-[hsl(210,40%,98%)]">{article.title}</p>
                        <p className="text-xs text-[hsl(215,20%,60%)] line-clamp-1 max-w-md">
                          {article.summary}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCategoryColor(article.category)}>
                      {article.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[hsl(215,20%,70%)]">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {article.publishedDate}
                    </div>
                  </TableCell>
                  <TableCell className="text-[hsl(215,20%,70%)]">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime} min
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
              ))}
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief description of the article..."
                className="bg-[hsl(222,47%,7%)] border-[hsl(215,25%,25%)] min-h-[100px]"
                required
              />
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
                      <SelectItem key={c} value={c}>{c}</SelectItem>
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
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingArticle ? 'Save Changes' : 'Create Article'}
              </Button>
            </div>
          </form>
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
