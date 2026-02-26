"use client";

import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LettersPage() {
  return (
    <div>
      <PageHeader
        title="Письма"
        description="В MVP список писем не запрашивается с backend (нет list endpoint). Письма открываются из карточки вакансии."
      />
      <Card>
        <CardHeader>
          <CardTitle>Как работать с письмами</CardTitle>
          <CardDescription>Откройте профиль поиска → вакансии → «Письмо».</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/search-profiles">Профили поиска</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/vacancies">Вакансии</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

