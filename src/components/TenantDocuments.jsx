
"use client";

import { FileText, Download, Image as ImageIcon, FileQuestion, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const DocumentCard = ({ title, url, type }) => {
    const isImage = type === 'image';
    const isPdf = url?.endsWith('.pdf');

    const Icon = isImage ? ImageIcon : (isPdf ? FileText : FileQuestion);

    return (
        <div className="border rounded-lg p-4 flex flex-col items-center justify-center space-y-3 relative overflow-hidden group">
            {url ? (
                <>
                    {isImage ? (
                        <img src={url} alt={title} className="w-32 h-32 object-cover rounded-md" />
                    ) : (
                        <div className="w-32 h-32 bg-muted rounded-md flex items-center justify-center">
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
                <div className="w-32 h-32 bg-muted rounded-md flex flex-col items-center justify-center text-center p-2">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Not Uploaded by Owner</span>
                </div>
            )}
            <p className="text-sm font-medium text-center">{title}</p>
        </div>
    );
}

export default function TenantDocuments({ tenant }) {
    return (
        <div className="space-y-6">
            <Card className="glass-card">
                <CardHeader>
                     <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16 border-2 border-primary">
                            <AvatarImage src={tenant.profilePhotoUrl} alt={tenant.name} />
                            <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">My Documents</CardTitle>
                            <CardDescription>View and download your important documents.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
    )
}
