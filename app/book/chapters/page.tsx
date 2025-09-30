import Link from "next/link";
import { getAllChapters } from "@/lib/data/chapters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, BookOpen } from "lucide-react";

export const metadata = {
  title: "All Chapters",
  description: "Read all 69 chapters of Bob's Adventure Realm epic journey.",
};

export default function ChaptersPage() {
  const chapters = getAllChapters();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Book className="h-8 w-8 text-ocean-blue-600" />
          <h1 className="font-serif text-4xl font-bold">All Chapters</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Read all {chapters.length} chapters of Bob the Turtle's epic adventure across the Adventure Realm
        </p>
      </div>

      <div className="grid gap-4">
        {chapters.map((chapter) => (
          <Card key={chapter.number} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    Chapter {chapter.number}: {chapter.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {chapter.wordCount.toLocaleString()} words
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/book/chapters/${chapter.number}`}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Read
                  </Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
