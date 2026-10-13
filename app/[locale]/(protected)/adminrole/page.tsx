import React from 'react'
import SiteBreadcrumb from '@/components/site-breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import AdminroleList from './AdminroleList'

function AbseraInquiryPage() {
    return (
        <>
            <SiteBreadcrumb />
            <div className="space-y-6">
                <Card>
                    <CardContent className="p-0">
                        <AdminroleList />
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default AbseraInquiryPage
