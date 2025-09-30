import { getAllChapters, getChapter, getChapterContent, getPrevNextChapters } from "@/lib/data/chapters";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, List } from "lucide-react";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const chapters = getAllChapters();
  return chapters.map((chapter) => ({
    number: chapter.number.toString(),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }) {
  const resolvedParams = await params;
  const chapterNumber = parseInt(resolvedParams.number, 10);
  const chapter = getChapter(chapterNumber);
  
  if (!chapter) return { title: "Chapter Not Found" };

  return {
    title: `Chapter ${chapter.number}: ${chapter.title}`,
    description: `Read Chapter ${chapter.number} of Bob's Adventure Realm - ${chapter.wordCount.toLocaleString()} words`,
  };
}

export default async function ChapterPage({ params }: { params: Promise<{ number: string }> }) {
  const resolvedParams = await params;
  const chapterNumber = parseInt(resolvedParams.number, 10);
  const chapter = getChapter(chapterNumber);
  const chapterData = getChapterContent(chapterNumber);

  if (!chapter || !chapterData) {
    notFound();
  }

  const { prev, next } = getPrevNextChapters(chapterNumber);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <Button asChild variant="ghost">
          <Link href="/book/chapters">
            <List className="mr-2 h-4 w-4" />
            All Chapters
          </Link>
        </Button>

        <div className="flex gap-2">
          {prev && (
            <Button asChild variant="outline">
              <Link href={`/book/chapters/${prev.number}`}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Link>
            </Button>
          )}
          {next && (
            <Button asChild variant="outline">
              <Link href={`/book/chapters/${next.number}`}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Chapter Content */}
      <article className="max-w-4xl mx-auto">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap">{chapterData.content}</div>
        </div>
      </article>

      {/* Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-12 pt-8 border-t max-w-4xl mx-auto">
        {prev ? (
          <Button asChild variant="outline">
            <Link href={`/book/chapters/${prev.number}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Previous</div>
                <div className="font-semibold">Chapter {prev.number}</div>
              </div>
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {next ? (
          <Button asChild variant="outline">
            <Link href={`/book/chapters/${next.number}`}>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Next</div>
                <div className="font-semibold">Chapter {next.number}</div>
              </div>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
