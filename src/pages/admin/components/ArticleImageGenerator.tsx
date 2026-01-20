import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { ImageIcon, Loader2, RefreshCw, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ArticleContentBlock {
  type: 'heading' | 'paragraph' | 'list' | 'callout' | 'citation' | 'image';
  id?: string;
  level?: number;
  text?: string;
  items?: string[];
  variant?: 'info' | 'warning' | 'note';
}

interface ContentImage {
  sectionId: string;
  imageUrl: string;
  altText: string;
}

interface ArticleForImages {
  id: string;
  title: string;
  summary: string | null;
  content: ArticleContentBlock[] | null;
  featured_image_url: string | null;
  content_images: ContentImage[] | null;
}

interface ArticleImageGeneratorProps {
  article: ArticleForImages;
  isOpen: boolean;
  onClose: () => void;
  onImagesUpdated: () => void;
}

interface SectionWithContent {
  sectionId: string;
  sectionTitle: string;
  contentSummary: string;
  keyTerms: string[];
  imagePrompt: string;
}

// Helper: Extract content after a heading until the next heading
const extractSectionContent = (
  content: ArticleContentBlock[],
  headingIndex: number
): string => {
  const paragraphs: string[] = [];
  
  for (let i = headingIndex + 1; i < content.length; i++) {
    const block = content[i];
    // Stop at the next heading
    if (block.type === 'heading') {
      break;
    }
    if (block.type === 'paragraph' && block.text) {
      paragraphs.push(block.text);
    }
    if (block.type === 'list' && block.items) {
      paragraphs.push(block.items.join('. '));
    }
  }
  
  return paragraphs.join(' ').substring(0, 600); // Limit to 600 chars
};

// Helper: Extract key scientific terms from text
const extractKeyTerms = (text: string): string[] => {
  const terms: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Common peptide names and scientific terms to look for
  const peptidePatterns = [
    /\b(BPC-157|TB-500|GHK-Cu|Thymosin|Ipamorelin|CJC-1295|GHRP-6|GHRP-2|Melanotan|PT-141|Semax|Selank|Epithalon|AOD-9604|Hexarelin|Sermorelin|Tesamorelin|Kisspeptin|MGF|IGF-1)\b/gi,
    /\b(peptide|amino acid|sequence|purity|HPLC|mass spectrometry|lyophilized|reconstitution|bacteriostatic|subcutaneous|intramuscular)\b/gi,
    /\b(certificate of analysis|COA|third-party testing|laboratory|quality control|quality assurance)\b/gi,
    /\b(vial|syringe|storage|freezer|temperature|stability|degradation|contamination|sterile)\b/gi,
    /\b(research|clinical|mechanism|receptor|binding|synthesis|metabolism|bioavailability)\b/gi,
  ];
  
  peptidePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const normalized = match.toLowerCase();
        if (!terms.includes(normalized)) {
          terms.push(normalized);
        }
      });
    }
  });
  
  return terms.slice(0, 8); // Return top 8 terms
};

// Helper: Build a detailed, content-specific image prompt
const buildDetailedPrompt = (
  sectionTitle: string,
  contentSummary: string,
  keyTerms: string[],
  articleTitle: string
): string => {
  const termsStr = keyTerms.length > 0 
    ? `Visual elements to include: ${keyTerms.slice(0, 5).join(', ')}.` 
    : '';
  
  const contentContext = contentSummary.length > 50
    ? `The section discusses: ${contentSummary.substring(0, 250)}`
    : '';
  
  return `Create a SPECIFIC scientific illustration for "${sectionTitle}" in the article "${articleTitle}".
${contentContext}
${termsStr}
CRITICAL: Visualize the EXACT concepts discussed - show specific equipment, molecules, or processes mentioned. DO NOT create generic lab imagery.
Style: Dark slate-900 background, cyan/electric blue accents, professional research aesthetic, ultra high resolution, 16:9 aspect ratio.`;
};

// Helper: Extract sections with their content for image generation
const extractSectionsWithContent = (
  content: ArticleContentBlock[],
  articleTitle: string
): SectionWithContent[] => {
  const sections: SectionWithContent[] = [];
  
  content.forEach((block, index) => {
    if (block.type === 'heading' && block.id && block.text && block.level === 1) {
      const contentSummary = extractSectionContent(content, index);
      const keyTerms = extractKeyTerms(`${block.text} ${contentSummary}`);
      
      sections.push({
        sectionId: block.id,
        sectionTitle: block.text,
        contentSummary,
        keyTerms,
        imagePrompt: buildDetailedPrompt(block.text, contentSummary, keyTerms, articleTitle)
      });
    }
  });
  
  return sections.slice(0, 3); // Max 3 sections
};

export function ArticleImageGenerator({
  article,
  isOpen,
  onClose,
  onImagesUpdated,
}: ArticleImageGeneratorProps) {
  const [isGeneratingFeatured, setIsGeneratingFeatured] = useState(false);
  const [isGeneratingSections, setIsGeneratingSections] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [localFeaturedImage, setLocalFeaturedImage] = useState<string | null>(article.featured_image_url);
  const [localContentImages, setLocalContentImages] = useState<ContentImage[]>(article.content_images || []);

  // Extract section headings WITH their content for context-aware prompts
  const sectionHeadings = extractSectionsWithContent(article.content || [], article.title);

  const handleGenerateFeatured = async () => {
    setIsGeneratingFeatured(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-article-images', {
        body: {
          articleTitle: article.title,
          articleSummary: article.summary || '',
          sectionSuggestions: [],
          regenerateFeatured: true,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to generate image');

      if (data.featuredImageUrl) {
        setLocalFeaturedImage(data.featuredImageUrl);
        
        // Update database
        const { error: updateError } = await supabase
          .from('articles')
          .update({ featured_image_url: data.featuredImageUrl })
          .eq('id', article.id);

        if (updateError) throw updateError;
        
        toast.success('Featured image generated!');
        onImagesUpdated();
      } else {
        toast.error('Failed to generate featured image');
      }
    } catch (err: any) {
      console.error('Error generating featured image:', err);
      toast.error(err.message || 'Failed to generate featured image');
    } finally {
      setIsGeneratingFeatured(false);
    }
  };

  const handleGenerateSectionImages = async () => {
    if (sectionHeadings.length === 0) {
      toast.error('No section headings found in article content');
      return;
    }

    setIsGeneratingSections(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-article-images', {
        body: {
          articleTitle: article.title,
          articleSummary: article.summary || '',
          sectionSuggestions: sectionHeadings,
          regenerateFeatured: false,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to generate images');

      if (data.contentImages && data.contentImages.length > 0) {
        // Merge with existing images (replace matching sectionIds)
        const updatedImages = [...localContentImages];
        data.contentImages.forEach((newImg: ContentImage) => {
          const existingIndex = updatedImages.findIndex(img => img.sectionId === newImg.sectionId);
          if (existingIndex >= 0) {
            updatedImages[existingIndex] = newImg;
          } else {
            updatedImages.push(newImg);
          }
        });
        
        setLocalContentImages(updatedImages);
        
        // Update database - cast to JSON type
        const { error: updateError } = await supabase
          .from('articles')
          .update({ content_images: JSON.parse(JSON.stringify(updatedImages)) })
          .eq('id', article.id);

        if (updateError) throw updateError;
        
        toast.success(`${data.contentImages.length} section image(s) generated!`);
        onImagesUpdated();
      } else {
        toast.warning('No section images were generated');
      }
    } catch (err: any) {
      console.error('Error generating section images:', err);
      toast.error(err.message || 'Failed to generate section images');
    } finally {
      setIsGeneratingSections(false);
    }
  };

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-article-images', {
        body: {
          articleTitle: article.title,
          articleSummary: article.summary || '',
          sectionSuggestions: sectionHeadings,
          regenerateFeatured: true,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to generate images');

      const updates: { featured_image_url?: string; content_images?: ContentImage[] } = {};

      if (data.featuredImageUrl) {
        setLocalFeaturedImage(data.featuredImageUrl);
        updates.featured_image_url = data.featuredImageUrl;
      }

      if (data.contentImages && data.contentImages.length > 0) {
        setLocalContentImages(data.contentImages);
        updates.content_images = data.contentImages;
      }

      if (Object.keys(updates).length > 0) {
        // Build update object with proper JSON serialization
        const dbUpdates: Record<string, unknown> = {};
        if (updates.featured_image_url) dbUpdates.featured_image_url = updates.featured_image_url;
        if (updates.content_images) dbUpdates.content_images = JSON.parse(JSON.stringify(updates.content_images));

        const { error: updateError } = await supabase
          .from('articles')
          .update(dbUpdates)
          .eq('id', article.id);

        if (updateError) throw updateError;
        
        toast.success('All images generated successfully!');
        onImagesUpdated();
      }
    } catch (err: any) {
      console.error('Error generating all images:', err);
      toast.error(err.message || 'Failed to generate images');
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const isAnyGenerating = isGeneratingFeatured || isGeneratingSections || isGeneratingAll;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[hsl(222,47%,11%)] border-[hsl(215,25%,20%)] text-[hsl(210,40%,98%)] max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Manage Article Images
          </DialogTitle>
          <DialogDescription className="text-[hsl(215,20%,60%)]">
            Generate or regenerate AI images for "{article.title}"
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Generate All Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleGenerateAll}
                disabled={isAnyGenerating}
                className="w-full max-w-xs"
              >
                {isGeneratingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating All Images...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate All Images
                  </>
                )}
              </Button>
            </div>

            {/* Featured Image Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-[hsl(210,40%,98%)]">Featured Image</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateFeatured}
                  disabled={isAnyGenerating}
                >
                  {isGeneratingFeatured ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : localFeaturedImage ? (
                    <>
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Regenerate
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1 h-3 w-3" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
              {localFeaturedImage ? (
                <div className="relative">
                  <img
                    src={localFeaturedImage}
                    alt="Featured"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 bg-success/90 text-white px-2 py-0.5 rounded text-xs flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Generated
                  </div>
                </div>
              ) : (
                <div className="w-full h-40 bg-[hsl(222,47%,7%)] rounded-lg flex items-center justify-center text-[hsl(215,20%,50%)]">
                  No featured image
                </div>
              )}
            </div>

            {/* Section Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-[hsl(210,40%,98%)]">
                  Section Images ({sectionHeadings.length} sections found)
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSectionImages}
                  disabled={isAnyGenerating || sectionHeadings.length === 0}
                >
                  {isGeneratingSections ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : localContentImages.length > 0 ? (
                    <>
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Regenerate All
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1 h-3 w-3" />
                      Generate All
                    </>
                  )}
                </Button>
              </div>

              {sectionHeadings.length === 0 ? (
                <p className="text-sm text-[hsl(215,20%,50%)] bg-[hsl(222,47%,7%)] rounded-lg p-4">
                  No section headings (H2) found in article content. Add content with headings to generate section images.
                </p>
              ) : (
                <div className="space-y-3">
                  {sectionHeadings.map((section) => {
                    const existingImage = localContentImages.find(img => img.sectionId === section.sectionId);
                    return (
                      <div key={section.sectionId} className="bg-[hsl(222,47%,7%)] rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[hsl(210,40%,98%)] truncate">
                              {section.sectionTitle}
                            </p>
                            <p className="text-xs text-[hsl(215,20%,50%)]">ID: {section.sectionId}</p>
                          </div>
                          {existingImage ? (
                            <div className="relative">
                              <img
                                src={existingImage.imageUrl}
                                alt={existingImage.altText}
                                className="w-24 h-16 object-cover rounded"
                              />
                              <div className="absolute -top-1 -right-1 bg-success text-white rounded-full p-0.5">
                                <Check className="h-2.5 w-2.5" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-24 h-16 bg-[hsl(215,25%,15%)] rounded flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-[hsl(215,20%,40%)]" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t border-[hsl(215,25%,20%)]">
          <Button variant="outline" onClick={onClose} disabled={isAnyGenerating}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}