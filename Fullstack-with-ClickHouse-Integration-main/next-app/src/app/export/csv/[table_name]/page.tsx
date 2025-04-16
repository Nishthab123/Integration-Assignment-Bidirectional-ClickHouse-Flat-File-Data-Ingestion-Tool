"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileDown } from "lucide-react";
import { saveAs } from "file-saver";
import { json2csv } from "json-2-csv";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { formatString } from "@/lib/utils";
import axios from "@/lib/axios";
import { AxiosError } from "axios";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface TableData {
  [key: string]: string | number | boolean | null;
}

export default function Page({
  params,
}: {
  params: Promise<{ table_name: string }>;
}) {
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [tableName, setTableName] = useState<string>("");
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setTableName((await params).table_name);
        setCsvFileName(formatString((await params).table_name) + ".csv");
        const response = await axios.get<TableData[]>(
          `/api/tables/${(await params).table_name}`
        );
        setTableData(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(
          err instanceof AxiosError ? err.response?.data.error : err.message
        );
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const handleCsvFileNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCsvFileName(e.target.value);
    },
    []
  );

  const convertArrayToCsvAndDownload = useCallback(async () => {
    if (!tableData || tableData.length === 0) {
      setError("No data to convert. Please provide an array of objects.");
      return;
    }

    try {
      // Use json-2-csv to convert the array of objects to CSV
      const csv = await json2csv(tableData);

      // Create a Blob from the CSV string
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

      // Use file-saver to trigger the download
      saveAs(blob, csvFileName.trim() ? csvFileName.trim() : "data.csv");
      setError(null);
    } catch (err: any) {
      setError(`Error converting to CSV: ${err.message}`);
    }
  }, [tableData, csvFileName]);

  return (
    <div className="max-lg:mx-4 mx-12">
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>
              Export
              <span className="capitalize">{` ${formatString(
                tableName
              )} `}</span>
              to CSV File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="csv-file-name" className="text-left">
                CSV File Name
              </Label>
              <Input
                id="csv-file-name"
                type="text"
                placeholder="Enter CSV file name (e.g., data.csv)"
                value={csvFileName}
                onChange={handleCsvFileNameChange}
                className="w-full md:w-1/2"
              />
            </div>
            {loading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-8 w-1/5" />
              </div>
            ) : (
              <>
                <Button
                  onClick={convertArrayToCsvAndDownload}
                  className="w-full md:w-auto cursor-pointer"
                  disabled={!!error}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {!error && tableData && (
                  <div className="text-sm text-gray-500">
                    Preview:
                    <pre className="bg-gray-100 max-h-96 rounded-md p-2 overflow-auto text-xs">
                      <code>
                        {tableData.length > 0
                          ? json2csv(tableData)
                          : "No Data Available"}
                      </code>
                    </pre>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-evenly">
        <Link href={`/tables/${tableName}`}>
          <Button className="cursor-pointer">Go Back</Button>
        </Link>
      </div>
    </div>
  );
}
