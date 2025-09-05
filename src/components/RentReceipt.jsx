
"use client";

import { Printer, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import AppLogo from './AppLogo';

export default function RentReceipt({ receiptDetails, onBack, appState }) {
    const { payment, tenant } = receiptDetails;
    const { defaults = {}, MOCK_USER_INITIAL = {} } = appState;
    const adminDetails = MOCK_USER_INITIAL;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-4 no-print">
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
                 <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print or Save as PDF
                </Button>
            </div>
            
            {/* The actual printable receipt */}
            <div className="printable-area max-w-2xl mx-auto p-4 bg-background">
                <Card className="border shadow-none">
                    <CardHeader className="p-6 border-b">
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
                                <p className="text-black">Rent for {format(parseISO(payment.date), 'MMMM yyyy')}</p>
                                <p className="font-semibold text-black">{payment.amount.toLocaleString()}</p>
                            </div>
                        </div>

                         <div className="flex justify-between items-center bg-muted p-4 rounded-md">
                            <p className="text-lg font-bold text-black">Total Paid</p>
                            <p className="text-2xl font-bold text-black">{payment.amount.toLocaleString()}</p>
                        </div>
                        
                        <p className="text-xs text-muted-foreground text-center pt-4">
                           This is a computer-generated bill and does not require a signature.
                        </p>
                    </CardContent>
                </Card>
            </div>


            <style jsx global>{`
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .printable-area {
                        display: block !important;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: auto;
                        padding: 0;
                        margin: 0;
                        background: #ffffff !important;
                    }
                    .printable-area * {
                        color: #000000 !important;
                        background-color: transparent !important;
                        box-shadow: none !important;
                        text-shadow: none !important;
                    }
                    .printable-area .bg-muted {
                        background-color: #f1f5f9 !important;
                    }
                    .printable-area .text-muted-foreground {
                        color: #555 !important;
                    }
                }
                @page {
                    size: A4;
                    margin: 20mm;
                }
            `}</style>
        </div>
    );
}
