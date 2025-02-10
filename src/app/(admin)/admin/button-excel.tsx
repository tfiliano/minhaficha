"use client";

import { Button } from "@/components/ui/button";
import { LoaderIcon, SheetIcon } from "lucide-react";
import { useState } from "react";

export function ButtonExcel() {
  const [isLoading, setLoading] = useState(false);

  async function fetchExcelData() {
    try {
      setLoading(true);

      const response = await fetch("/api/produtos/excel", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.blob();
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lista.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Failed to fetch Excel data:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end mb-4 w-full">
      <Button className="w-full sm:w-fit gap-2" onClick={fetchExcelData}>
        {isLoading ? (
          <LoaderIcon className="animate-spin" />
        ) : (
          <>
            <SheetIcon />
            Baixar lista
          </>
        )}
      </Button>
    </div>
  );
}
