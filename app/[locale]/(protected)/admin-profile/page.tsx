'use client'
import React from 'react'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import SiteBreadcrumb from '@/components/site-breadcrumb'
import Card from '@/components/code-snippet'
import ProfileCard from './ProfileCard'

function ProfilePage() {
  const router = useRouter()

  const handleBackRoute = () => {
    router.back();
  }
  return (
    <>
      <SiteBreadcrumb />
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackRoute}
            className="flex items-center text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <Icon icon="mdi:arrow-left" width={24} height={24} />
          </button>
          <h1 className="text-2xl font-semibold">Profile</h1>
        </div>
        <Card title="" code={''}>
          <ProfileCard />
        </Card>
      </div>
    </>
  )
}

export default ProfilePage
