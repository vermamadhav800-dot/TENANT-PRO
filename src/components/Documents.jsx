
"use client";

import { FileText, User, FolderArchive, Download, Image as ImageIcon, FileQuestion, UploadCloud, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';


const DocumentCard = ({ title, url, type }) => {
    const isImage = type === 'image';
    const isPdf = url?.endsWith('.pdf');

    const Icon = isImage ? ImageIcon : (isPdf ? FileText : FileQuestion);

    return (
        <div className="border rounded-lg p-4 flex flex-col items-center justify-center space-y-3 relative overflow-hidden group">
            {url ? (
                <>
                    {isImage ? (
                        <img src={url} alt={title} className="w-24 h-24 object-cover rounded-md" />
                    ) : (
                        <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                            <Icon className="w-12 h-12 text-muted-foreground" />
                        </div>
                    )}
                    <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Download className="w-8 h-8 text-white" />
                    </a>
                </>
            ) : (
                <div className="w-24 h-24 bg-muted rounded-md flex flex-col items-center justify-center text-center p-2">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Not Uploaded</span>
                </div>
            )}
            <p className="text-sm font-medium text-center">{title}</p>
        </div>
    );
}

const TenantDocuments = ({ tenant }) => {
    return (
        <Card className="glass-card">
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="w-12 h-12 border">
                    <AvatarImage src={tenant.profilePhotoUrl} alt={tenant.name} />
                    <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{tenant.name}</CardTitle>
                    <CardDescription>Room {tenant.unitNo}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DocumentCard 
                    title="Profile Photo" 
                    url={tenant.profilePhotoUrl}
                    type="image"
                />
                <DocumentCard 
                    title="Aadhaar Card" 
                    url={tenant.aadhaarCardUrl}
                    type="image" // Assuming images for preview
                />
                 <DocumentCard 
                    title="Lease Agreement" 
                    url={tenant.leaseAgreementUrl}
                    type="file" // Can be pdf or image
                />
            </CardContent>
        </Card>
    )
}

export default function Documents({ appState, setActiveTab }) {
  const { tenants = [] } = appState;
  
  const tenantsWithDocuments = tenants.filter(t => t.aadhaarCardUrl || t.leaseAgreementUrl);
  const tenantsWithoutDocuments = tenants.filter(t => !t.aadhaarCardUrl && !t.leaseAgreementUrl);

  const renderTenantList = (tenantList) => {
      if (tenantList.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-2xl">
                <FolderArchive className="mx-auto h-16 w-16 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Documents Here</h3>
                <p>No tenants in this category have documents uploaded.</p>
            </div>
        )
      }
      return (
        <div className="space-y-6">
            {tenantList.map(tenant => <TenantDocuments key={tenant.id} tenant={tenant} />)}
        </div>
      )
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold font-headline">Document Hub</h2>
          <p className="text-muted-foreground">A central place to view all tenant documents.</p>
        </div>
        <Button onClick={() => setActiveTab('tenants')}>
            <UploadCloud className="mr-2 h-4 w-4" /> Upload Documents
        </Button>
      </div>

       <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Tenants ({tenants.length})</TabsTrigger>
                <TabsTrigger value="complete">Complete ({tenantsWithDocuments.length})</TabsTrigger>
                <TabsTrigger value="incomplete">Incomplete ({tenantsWithoutDocuments.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
                {renderTenantList(tenants)}
            </TabsContent>
            <TabsContent value="complete" className="mt-6">
                {renderTenantList(tenantsWithDocuments)}
            </TabsContent>
            <TabsContent value="incomplete" className="mt-6">
                {renderTenantList(tenantsWithoutDocuments)}
            </TabsContent>
        </Tabs>
    </div>
  );
}
