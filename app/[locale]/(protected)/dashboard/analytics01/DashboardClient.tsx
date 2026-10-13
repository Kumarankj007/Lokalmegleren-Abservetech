"use client";
import Image from "next/image";
import { StatisticsBlock } from "@/components/blocks/statistics-block";
import { BlockBadge, WelcomeBlock } from "@/components/blocks/welcome-block";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RevinueBarChart from "@/components/revenue-bar-chart";
import DashboardDropdown from "@/components/dashboard-dropdown";
import OverviewChart from "./components/overview-chart";
import CompanyTable from "./components/company-table";
import RecentActivity from "./components/recent-activity";
import MostSales from "./components/most-sales";
import OverviewRadialChart from "./components/overview-radial";
import { useTranslations } from "next-intl";
import useReactQuery from "@/hooks/useReactQuery";
import { useState } from "react";
import Filters from "./components/Filters";
import { priceFormat } from "@/lib/utils";

export interface MonthlyRevenue {
  month: string;
  net: number;
}

export interface DashboardData {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  netRevenue: number;
  pendingApprovalQueueAmount: number;
  pendingApprovalQueuecount: number;
  pendingPayoutAmount: number;
  pendingPayoutsCount: number;
  pendingCourseReviews: number;
  pendingApprovalcount: number;
  monthlyRevenue: MonthlyRevenue[];
  totalMonths: number;
}

export interface DashboardResponse {
  status: boolean;
  message: string;
  data: DashboardData;
}

export default function DashboardClient() {
  const t = useTranslations("AnalyticsDashboard");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [filterQuery, setFilterQuery] = useState("");
  const queryString = `?page=${page}&limit=${limit}${filterQuery}`;
  const {
    data: dataRes,
    isLoading,
    isError,
  } = useReactQuery<DashboardResponse>("GET_DASHBOARD", queryString);
  const dashboard = dataRes?.data;
  const totalPages = Math.ceil((dashboard?.totalMonths || 0) / limit);

  if (isError)
    return <p className="p-4 text-red-500">Error loading Dashboard.</p>;
  return (
    <div>
      <div className="grid grid-cols-12 items-center gap-5 mb-5">
        <div className="col-span-12">
          <Card>
            <CardContent className="p-4">
              <div className="grid md:grid-cols-3   gap-4">
                <StatisticsBlock
                  title={"Total Students"}
                  total={dashboard?.totalStudents?.toLocaleString()}
                  className="bg-info/10 border-none shadow-none"
                />
                <StatisticsBlock
                  title={"Total Instructors"}
                  total={dashboard?.totalInstructors?.toLocaleString()}
                  className="bg-warning/10 border-none shadow-none"
                  chartColor="#FB8F65"
                />
                <StatisticsBlock
                  title={"Total Courses"}
                  total={dashboard?.totalCourses?.toLocaleString()}
                  pending={dashboard?.pendingCourseReviews + " pending review"}
                  className="bg-primary/10 border-none shadow-none"
                  chartColor="#2563eb"
                />
                <StatisticsBlock
                  title={"Net to Platform"}
                  total={priceFormat(dashboard?.netRevenue || 0, 2)}
                  className="bg-warning/10 border-none shadow-none"
                  chartColor="#FB8F65"
                />
                <StatisticsBlock
                  title={"Pending Payouts"}
                  total={dashboard?.pendingPayoutAmount?.toLocaleString()}
                  pending={dashboard?.pendingPayoutsCount + " requests pending"}
                  className="bg-primary/10 border-none shadow-none"
                  chartColor="#2563eb"
                />
                <StatisticsBlock
                  title={"Approval Queue"}
                  total={priceFormat(dashboard?.pendingApprovalQueueAmount || 0, 2)}
                  pending={
                    dashboard?.pendingApprovalQueuecount + " requests pending"
                  }
                  className="bg-info/10 border-none shadow-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 mt-5">
        {/* <div className="lg:col-span-8 col-span-12">
            <Card>
              <CardContent className="p-4">
                <RevinueBarChart/>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-4 col-span-12">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <CardTitle className="flex-1">
                  {t("overview_circle_chart_title")}
                </CardTitle>
                <DashboardDropdown />
              </CardHeader>
              <CardContent>
                <OverviewChart />
              </CardContent>
            </Card>
          </div> */}
        <div className="lg:col-span-8 col-span-12">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <CardTitle className="flex-1">{"Monthly Revenue"}</CardTitle>
              {/* <DashboardDropdown /> */}
              <Filters setFilterQuery={setFilterQuery} />
            </CardHeader>
            <CardContent className="p-5">
              <CompanyTable
                data={dashboard?.monthlyRevenue || []}
                isLoading={isLoading}
                page={page}
                setPage={setPage}
                totalPages={totalPages}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 col-span-12">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <CardTitle className="flex-1">{"Action Queues"}</CardTitle>
              {/* <DashboardDropdown /> */}
            </CardHeader>
            <CardContent>
              <RecentActivity
                coursePending={dashboard?.pendingCourseReviews || 0}
                payoutPending={dashboard?.pendingPayoutsCount || 0}
              />
            </CardContent>
          </Card>
        </div>
        {/* <div className="lg:col-span-8 col-span-12">
            <MostSales />
          </div> */}
        {/* <div className="lg:col-span-4 col-span-12">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <CardTitle className="flex-1">
                  {t("overview_circle_chart_title")}
                </CardTitle>
                <DashboardDropdown />
              </CardHeader>
              <CardContent>
                <OverviewRadialChart />
                <div className="bg-default-50 rounded p-4 mt-8 flex justify-between flex-wrap">
                  <div className="space-y-1">
                    <h4 className="text-default-600  text-xs font-normal">
                     {t("invested_amount")}
                    </h4>
                    <div className="text-sm font-medium text-default-900">
                      $8264.35
                    </div>
                    <div className="text-default-500  text-xs font-normal">
                      +0.001.23 (0.2%)
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-default-600  text-xs font-normal">
                     {t("invested_amount")}
                    </h4>
                    <div className="text-sm font-medium text-default-900">
                      $8264.35
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-default-600  text-xs font-normal">
                     {t("invested_amount")}
                    </h4>
                    <div className="text-sm font-medium text-default-900">
                      $8264.35
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}
      </div>
    </div>
  );
}
