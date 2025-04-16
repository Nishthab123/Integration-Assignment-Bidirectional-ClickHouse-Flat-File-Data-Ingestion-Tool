"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { readString } from "react-papaparse";
import { Label } from "@radix-ui/react-label";
import { formatString } from "@/lib/utils";
import { Duplex } from "stream";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TableData {
  [key: string]: string | number | boolean | null;
}

interface Column {
  label: string;
  key: string;
}

interface ColumnType {
  label: string;
  key: string;
  type: string;
}

const dataTypes: { [key: string]: string } = {
  string: "String",
  int32: "Int32",
  uint32: "UInt32",
  bool: "Bool",
  date: "Date",
};

export default function Page() {
  const router = useRouter();
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [columnTypes, setColumnsTypes] = useState<ColumnType[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tableName, setTableName] = useState<string>("");
  const [delimiter, setDelimiter] = useState<string>("");

  const resetData = useCallback(() => {
    setTableName("");
    setTableData([]);
    setColumns([]);
    setColumnsTypes([]);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      resetData();
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
        setTableName(
          (() => {
            const arr = e.target.files[0].name.split(".");
            return arr.slice(0, -1).join(".");
          })()
        );
        setError(null);
      }
    },
    []
  );

  const handleDelimiterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDelimiter(e.target.value);
      setError(null);
    },
    []
  );

  const handleTableNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTableName(e.target.value);
    },
    []
  );

  const handleTableUpload = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      try {
        const schema = columnTypes
          .map((ele) => [ele.key, dataTypes[ele.type]].join(" "))
          .join(", ");
        const createTableResponse = await axios.post(`/api/tables`, {
          tableName,
          schema,
        });
        const insertDataResponse = await axios.post(
          `/api/tables/${tableName}/data`,
          {
            data: tableData,
          }
        );
        router.push(`/tables/${tableName}`);
      } catch (error: any) {
        setError(error.response.data.error);
      }
    },
    [file, tableName, columnTypes]
  );

  const parseCSV = useCallback(() => {
    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    setError(null);
    setColumnsTypes([]);

    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target && typeof e.target.result === "string") {
        try {
          const result = readString(e.target.result, {
            header: true,
            skipEmptyLines: true,
            delimiter: delimiter,
            complete: () => {},
          }) as Duplex & {
            errors: Error[];
            data: TableData[];
          };

          if (result.errors.length > 0) {
            setError(result.errors[0].message);
            resetData();
            return;
          }

          if (result.data && result.data.length > 0) {
            const headerKeys = Object.keys(result.data[0]);
            const newColumns: Column[] = headerKeys.map((key: string) => ({
              label: formatString(key),
              key: key,
            }));
            const newColumnsTypes: ColumnType[] = [];
            for (let ele of newColumns) {
              let type = "string";
              try {
                const numRegex = new RegExp("^\\d+$");
                const boolRegex = new RegExp("^(0|1|(true)|(false))$");
                if (numRegex.test(result.data[1][ele.key] as string)) {
                  parseInt(result.data[1][ele.key] as string);
                  type = "int32";
                }
                if (
                  boolRegex.test(
                    (result.data[1][ele.key] as string).toLowerCase().trim()
                  )
                ) {
                  type = "bool";
                }
              } catch (error) {
                console.log(error);
              }
              newColumnsTypes.push({
                ...ele,
                type,
              });
            }
            setColumns(newColumns);
            setColumnsTypes(newColumnsTypes);
            setTableData(result.data);
          } else {
            resetData();
            setError(
              "No data found in the CSV file or invalid format. Ensure the CSV has headers."
            );
          }
        } catch (err: any) {
          setError(`Error parsing CSV: ${err.message}`);
          resetData();
        }
      }
    };

    reader.onerror = () => {
      setError("Error reading file.");
      resetData();
    };

    reader.readAsText(file);
  }, [file, delimiter]);

  return (
    <div className="max-lg:mx-4 mx-12">
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>CSV Reader</CardTitle>
            <CardDescription>Upload a CSV file to clickhouse.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                id="csv-file-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-auto cursor-pointer"
              />
              <Button
                className="cursor-pointer"
                onClick={parseCSV}
                disabled={!file}
              >
                Load CSV Data
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="csv-file-delimiter" className="font-medium">
                CSV Delimiter
              </Label>
              <Input
                id="csv-file-delimiter"
                placeholder="Auto detect by default"
                onChange={handleDelimiterChange}
                className="w-auto"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {tableData.length > 0 && columns.length > 0 && (
              <div>
                <div className="flex items-center gap-4">
                  <Label htmlFor="csv-file-name" className="font-medium">
                    Table Name
                  </Label>
                  <Input
                    id="csv-file-name"
                    placeholder="Table Name"
                    defaultValue={tableName}
                    onChange={handleTableNameChange}
                    className="w-auto"
                  />
                </div>
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Column Name</TableHead>
                        <TableHead className="w-1/3">Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {columnTypes.map((ele, index) => (
                        <TableRow key={index}>
                          <TableCell className="capitalize">
                            {ele.label}
                          </TableCell>
                          <TableCell>
                            <Select defaultValue={ele.type}>
                              <SelectTrigger className="w-full capitalize cursor-pointer">
                                <SelectValue placeholder="Theme" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(dataTypes).map((ele, index) => (
                                  <SelectItem
                                    key={index}
                                    value={ele}
                                    className="capitalize cursor-pointer"
                                  >
                                    {dataTypes[ele]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="capitalize">
                        {columns.map((column) => (
                          <TableHead key={column.key}>{column.label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData.map((rowData, index) => (
                        <TableRow key={index}>
                          {columns.map((column) => (
                            <TableCell key={`${index}-${column.key}`}>
                              {rowData[column.key] === null ? (
                                <span className="italic text-gray-500">
                                  N/A
                                </span>
                              ) : typeof rowData[column.key] === "boolean" ? (
                                rowData[column.key] ? (
                                  "Yes"
                                ) : (
                                  "No"
                                )
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
                <div className="pt-4">
                  <Button
                    onClick={handleTableUpload}
                    className="cursor-pointer"
                  >
                    Upload Table
                  </Button>
                </div>
              </div>
            )}
            {tableData.length === 0 && !error && (
              <div className="text-gray-500 text-center py-4">
                No CSV data to display. Upload a file to see the data.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-evenly">
        <Link href={"/tables"}>
          <Button className="cursor-pointer">Go Back</Button>
        </Link>
      </div>
    </div>
  );
}
