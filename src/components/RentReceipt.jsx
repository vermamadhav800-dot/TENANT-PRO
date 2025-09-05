
"use client";

import { Printer, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
                    <h2 className="text-2xl font-bold">Rent Receipt</h2>
                    <p className="text-muted-foreground">Previewing receipt for payment #{payment.id.slice(-6)}</p>
                </div>
            </div>

            <div className="flex justify-end max-w-4xl mx-auto">
                 <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print or Save as PDF
                </Button>
            </div>
            
            {/* The actual printable receipt */}
            <div className="max-w-4xl mx-auto printable-area p-4 bg-background">
                <Card className="border-2 border-primary shadow-2xl">
                    <CardHeader className="p-8 border-b-2 border-primary">
                        <div className="flex justify-between items-start">
                             <div>
                                <h1 className="text-4xl font-bold text-primary">RENT RECEIPT</h1>
                                <p className="text-muted-foreground mt-2">Receipt No: {payment.id}</p>
                                <p className="text-muted-foreground">Date Issued: {format(new Date(), 'dd MMMM, yyyy')}</p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <AppLogo className="w-16 h-16 mb-2" iconClassName="w-8 h-8"/>
                                <p className="text-xl font-bold">{defaults.propertyName || '[Your Property Name]'}</p>
                                <p className="text-sm text-muted-foreground">{defaults.propertyAddress || '[Your Property Address]'}</p>
                                <p className="text-sm text-muted-foreground">{adminDetails.username}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-8 text-base">
                            <div>
                                <h4 className="font-semibold text-muted-foreground mb-2 text-sm uppercase tracking-wider">RECEIVED FROM</h4>
                                <p className="font-bold text-lg">{tenant.name}</p>
                                <p>Room {tenant.unitNo}</p>
                                <p>{tenant.phone}</p>
                            </div>
                            <div className="text-right">
                                <h4 className="font-semibold text-muted-foreground mb-2 text-sm uppercase tracking-wider">LANDLORD</h4>
                                <p className="font-bold text-lg">{adminDetails.name}</p>
                                <p>{adminDetails.username}</p>
                            </div>
                        </div>

                        <div className="border-y-2 border-dashed py-6 my-6 space-y-4">
                             <div className="flex justify-between items-center text-lg">
                                <p className="text-muted-foreground">Rent for the period of {format(parseISO(payment.date), 'MMMM yyyy')}</p>
                                <p className="font-semibold">₹{payment.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <p className="text-muted-foreground">Paid via {payment.method} on {format(parseISO(payment.date), 'dd MMM, yyyy')}</p>
                            </div>
                        </div>

                         <div className="flex justify-between items-center bg-primary/10 p-6 rounded-lg">
                            <p className="text-2xl font-bold text-primary uppercase">Total Paid</p>
                            <p className="text-4xl font-bold text-primary">₹{payment.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50 p-4 border-t-2 text-center text-xs text-muted-foreground">
                        This is a computer-generated receipt. If you have any questions, please contact us at {adminDetails.username}.
                        <br/>
                        {defaults.propertyName} - {defaults.propertyAddress}
                    </CardFooter>
                </Card>
            </div>


            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printable-area, .printable-area * {
                        visibility: visible;
                    }
                    .printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        border: none;
                        box-shadow: none;
                        margin: 0;
                        padding: 0;
                    }
                    .no-print {
                        display: none;
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
