"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatString } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

interface TableData {
  [key: string]: string | number | boolean | null;
}

interface Column {
  label: string;
  key: string;
}

export default function Page({
  params,
}: {
  params: Promise<{ table_name: string }>;
}) {
  const router = useRouter();
  const [tableName, setTableName] = useState<string>("Table");
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<String | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setTableName((await params).table_name);
      try {
        const response = await axios.get<TableData[]>(
          `/api/tables/${(await params).table_name}`
        );
        setTableData(response.data);
        setColumns(
          response.data.length > 0
            ? Object.keys(response.data[0]).map((ele) => ({
                label: formatString(ele),
                key: ele,
              }))
            : []
        );
        setLoading(false);
      } catch (err: any) {
        setError(
          err instanceof AxiosError ? err.response?.data.error : err.message
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  async function handleDeleteTable() {
    try {
      await axios.delete<{ message: string }>(
        `/api/tables/${(await params).table_name}`
      );
      router.push("/tables");
    } catch (error: any) {
      console.error(error);
    }
  }

  function Loading() {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Loading Table Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-5 w-20" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function Error({ error }: { error: String }) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Error: {error}</p>
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
            <CardTitle className="capitalize">
              {formatString(tableName)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead className="capitalize" key={column.key}>
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((rowData, index) => (
                    <TableRow key={index}>
                      {columns.map((column) => (
                        <TableCell key={`${index}-${column.key}`}>
                          {column.key === "isVerified" ? (
                            rowData[column.key] === true ? (
                              "Yes"
                            ) : (
                              "No"
                            )
                          ) : rowData[column.key] === null ? (
                            <span className="italic text-gray-500">N/A</span>
                          ) : (
                            rowData[column.key]
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
        <Link href={"/tables"}>
          <Button className="cursor-pointer">Go Back</Button>
        </Link>
        <Link href={`/export/csv/${tableName}`}>
          <Button className="cursor-pointer">Export Table</Button>
        </Link>
        <Button onClick={handleDeleteTable} className="cursor-pointer">
          Delete Table
        </Button>
      </div>
    </div>
  );
}
