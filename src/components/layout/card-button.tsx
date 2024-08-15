import Link from "next/link";
import { UrlObject } from "url";
import { Card, CardContent } from "../ui/card";

export function CardButton({
  title,
  url,
}: {
  title: string;
  url: string | UrlObject;
}) {
  return (
    <Link href={url}>
      <Card className="mx-auto bg-primary w-72 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer hover:ring ring-primary  dark:hover:ring-white">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <h3 className="text-lg font-semibold text-center">{title}</h3>
        </CardContent>
      </Card>
    </Link>
  );
}
