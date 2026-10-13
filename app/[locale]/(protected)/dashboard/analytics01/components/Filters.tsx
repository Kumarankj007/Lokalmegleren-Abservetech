"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { APICONSTANT, APIURLS } from "@/services/config";
import axios from "axios";

const Filters = ({ setFilterQuery }: any) => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const FilterQuery = () => {
    let query = "";
    if (dateFrom && dateTo) {
      const fromDateStr = format(dateFrom, "yyyy-MM-dd");
      query += `&fromDate=${fromDateStr}`;
      const toDateStr = format(dateTo, "yyyy-MM-dd");
      query += `&toDate=${toDateStr}`;
    }
    if (statusFilter && statusFilter !== "All") {
      query += `&range=${statusFilter}`;
    }
    if (statusFilter == "CUSTOM" && dateFrom && dateTo) {
      setFilterQuery(query);
    } else if (statusFilter != "CUSTOM") {
      setFilterQuery(query);
    }
  };

  useEffect(() => {
    FilterQuery();
  }, [dateFrom, dateTo, statusFilter]);

  const handleClear = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setStatusFilter("All");
  };

  return (
    <Card>
      {/* <CardContent className="pt-6">
      </CardContent> */}
      <div className="w-full grid grid-cols-1 md:flex md:flex-wrap md:gap-4 space-y-2 md:space-y-0">
        {/* Date Range */}
        {statusFilter == "CUSTOM" && (
          <div className="flex flex-col md:flex-row items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="md"
                  className={cn(
                    "w-full md:w-auto justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "From date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="md"
                  className={cn(
                    "w-full md:w-auto justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger size="md" className="w-full md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="THIS_MONTH">This Month</SelectItem>
            <SelectItem value="LAST_3_MONTHS">Last 3 Months</SelectItem>
            <SelectItem value="LAST_6_MONTHS">Last 6 Months</SelectItem>
            <SelectItem value="YTD">Year to Date</SelectItem>
            {/* <SelectItem value="LIFETIME">Life time</SelectItem> */}
            <SelectItem value="CUSTOM">Custom</SelectItem>
          </SelectContent>
        </Select>

        {(dateFrom || dateTo || statusFilter !== "All") && (
          <Button
            variant="ghost"
            size="md"
            onClick={handleClear}
            className="w-full md:w-auto text-muted-foreground"
          >
            X
          </Button>
        )}
      </div>
    </Card>
  );
};

export default Filters;
