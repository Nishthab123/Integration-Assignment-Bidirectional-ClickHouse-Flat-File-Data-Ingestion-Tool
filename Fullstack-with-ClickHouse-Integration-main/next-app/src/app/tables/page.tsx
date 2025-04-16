"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "@/lib/axios";
import Link from "next/link";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatString } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [names, setNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<string[]>("/api/tables");
        setNames(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  function Loading() {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Tables</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Skeleton className="h-4 w-1/12" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Skeleton className="h-4 w-1/6" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Skeleton className="h-4 w-1/8" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  function Error({ error }: { error: Error }) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Tables</CardTitle>
          </CardHeader>
          <CardContent className="text-red-500">
            Error loading Table names: {error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  function DynamicTable() {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Tables</CardTitle>
          </CardHeader>
          <CardContent className="capitalize">
            <Table>
              <TableBody>
                {names.map((name, index) => (
                  <TableRow key={index}>
                    <TableCell className="p-0">
                      <Link href={`/tables/${name}`} className="block p-2">
                        {formatString(name)}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-lg:mx-4 mx-12">
      {loading ? (
        <Loading />
      ) : error ? (
        <Error error={error} />
      ) : (
        <DynamicTable />
      )}
      <div className="flex justify-evenly">
        <Link href={"/import/csv"}>
          <Button className="cursor-pointer">Import Table</Button>
        </Link>
      </div>
    </div>
  );
}
