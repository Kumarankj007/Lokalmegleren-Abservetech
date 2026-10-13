import React from 'react'
import SiteBreadcrumb from '@/components/site-breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import AdminList from './AdminList'

function AbseraInquiryPage() {
    return (
        <>
            <SiteBreadcrumb />
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-0">
                        <AdminList />
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default AbseraInquiryPage
