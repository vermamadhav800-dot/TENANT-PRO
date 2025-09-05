
"use client";

import { useRef } from 'react';
import { Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import AppLogo from './AppLogo';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


export default function RentReceipt({ receiptDetails, onBack, appState }) {
    const { payment, tenant } = receiptDetails;
    const { defaults = {}, MOCK_USER_INITIAL = {} } = appState;
    const adminDetails = MOCK_USER_INITIAL;
    const receiptRef = useRef();

    const handleDownload = () => {
        const input = receiptRef.current;
        if (!input) return;

        html2canvas(input, { 
            scale: 2,
            removeContainer: true // This helps with issues related to complex CSS
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`rent-receipt-${payment.id}.pdf`);
        });
    };

    return (
        <div className="space-y-4">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold">Rent Bill</h2>
                    <p className="text-muted-foreground">Previewing bill for payment #{payment.id.slice(-6)}</p>
                </div>
            </div>

            <div className="flex justify-end max-w-2xl mx-auto">
                 <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
            </div>
            
            <div ref={receiptRef} className="printable-area max-w-2xl mx-auto p-4 bg-background">
                <Card className="border shadow-none">
                    <CardHeader className="p-6 border-b bg-muted/30">
                        <div className="flex justify-between items-center">
                             <div>
                                <h1 className="text-2xl font-bold text-black">RENT BILL</h1>
                                <p className="text-muted-foreground">Receipt No: {payment.id}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-black">{defaults.propertyName || '[Your Property Name]'}</p>
                                <p className="text-sm text-muted-foreground">{defaults.propertyAddress || '[Your Property Address]'}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <h4 className="font-semibold text-muted-foreground mb-1">BILLED TO</h4>
                                <p className="font-medium text-black">{tenant.name}</p>
                                <p className="text-black">Room {tenant.unitNo}</p>
                            </div>
                            <div className="text-right">
                                <h4 className="font-semibold text-muted-foreground mb-1">PAYMENT DATE</h4>
                                <p className="font-medium text-black">{format(parseISO(payment.date), 'dd MMMM, yyyy')}</p>
                            </div>
                        </div>

                        <div className="border-t border-b py-4">
                             <div className="flex justify-between items-center">
                                <p className="text-black">Rent for the period of {format(parseISO(payment.date), 'MMMM yyyy')}</p>
                                <p className="font-semibold text-black">{payment.amount.toLocaleString()}</p>
                            </div>
                        </div>

                         <div className="flex justify-between items-center bg-muted/50 p-4 rounded-md">
                            <p className="text-lg font-bold text-black">Total Paid</p>
                            <p className="text-2xl font-bold text-black">{payment.amount.toLocaleString()}</p>
                        </div>
                        
                        <p className="text-xs text-muted-foreground text-center pt-4">
                           This is a computer-generated bill and does not require a signature.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

