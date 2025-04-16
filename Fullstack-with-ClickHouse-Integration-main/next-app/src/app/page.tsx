import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Page() {
  return (
    <div className="max-lg:mx-4 mx-12">
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-4xl">Next.js with ClickHouse</CardTitle>
          </CardHeader>
          <CardContent className="text-center my-16">
            <Link href={"/tables"}>
              <Button>Get Started</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
