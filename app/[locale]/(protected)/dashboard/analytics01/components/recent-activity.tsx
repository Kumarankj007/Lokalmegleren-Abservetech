"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { activity } from "./data";
import React from 'react'
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from '@/components/navigation'

const RecentActivity = ({
  coursePending,
  payoutPending,
}: {
  coursePending?: number;
  payoutPending?: number;
}) => {
  const router = useRouter();
  const data = [
    {
      title: "Courses in Review",
      label: "Awaiting approval",
      count: coursePending || 0,
      route: "/course-reviews",
    },
    {
      title: "Payout Requests",
      label: "Pending processing",
      count: payoutPending || 0,
      route: "/payout-requests",
    },
  ];
  return (
    <ul className=" space-y-3 h-full ">
      {data.map((item, ind) => (
        <li
          className="flex items-center gap-3 border-b border-default-100 dark:border-default-300 last:border-b-0 pb-3 last:pb-0"
          key={ind}
        >
          {/* <Avatar className="w-8 h-8">
              <AvatarImage src={item.img} alt="next-avater" />
              <AvatarFallback> SA </AvatarFallback>
            </Avatar> */}
          <div className="flex-1 text-start overflow-hidden text-ellipsis whitespace-nowrap ">
            <div className="text-sm text-default-600 overflow-hidden font-bold text-ellipsis whitespace-nowrap">
              {item.title}
            </div>
            <div className="text-default-500 truncate text-sm font-medium">
              {item?.label}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="secondary">
              <div className="text-sm font-light text-default-600 dark:text-default-600">
                {item.count}
              </div>
            </Badge>
            <Button
              onClick={() => router.push(item?.route)}
              color="default"
              size="sm"
            >
              View
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default RecentActivity;
