
'use client';

import {useState} from 'react';
import {
  Sparkles,
  LoaderCircle,
  TrendingUp,
  BarChart,
  BadgePercent,
  Info,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Progress} from '@/components/ui/progress';
import {suggestRent} from '@/ai/flows/rent-optimizer-flow';
import type {RentAdvisorInput, RentAdvisorOutput} from '@/ai/flows/rent-optimizer-flow';
import type {AppState} from '@/lib/types';
import {useToast} from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface RentAdvisorProps {
  appState: AppState;
}

export default function RentAdvisor({appState}: RentAdvisorProps) {
  const {rooms} = appState;
  const {toast} = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RentAdvisorOutput | null>(null);
  const [formState, setFormState] = useState<Partial<RentAdvisorInput>>({
    amenities: [],
  });

  const handleRoomSelect = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if(room) {
        setFormState(prev => ({...prev, capacity: room.capacity, currentRent: room.rent}));
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.capacity || !formState.currentRent || !formState.city || !formState.neighborhood) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out all required fields to get a suggestion.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await suggestRent(formState as RentAdvisorInput);
      setResult(response);
    } catch (error) {
      console.error('Rent advisor error:', error);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description:
          'Could not retrieve rent suggestion. Please ensure your API key is set correctly.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <Sparkles className="mx-auto h-12 w-12 text-yellow-400" />
        <h2 className="text-3xl font-bold font-headline mt-2">AI Rent Advisor</h2>
        <p className="text-muted-foreground mt-2">
          Leverage AI to analyze market data and suggest the optimal rent for your properties.
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Analyze a Property</CardTitle>
          <CardDescription>
            Fill in the details below or select an existing room to get a rent suggestion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room-select">Select an Existing Room (Optional)</Label>
                <Select onValueChange={handleRoomSelect}>
                  <SelectTrigger id="room-select">
                    <SelectValue placeholder="Select a room to pre-fill" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>Room {room.number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <Label htmlFor="capacity">Capacity (Tenants)</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g., 2"
                  value={formState.capacity || ''}
                  onChange={(e) => setFormState({...formState, capacity: Number(e.target.value)})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="current-rent">Current Rent (Total)</Label>
                <Input
                  id="current-rent"
                  type="number"
                  placeholder="e.g., 15000"
                   value={formState.currentRent || ''}
                  onChange={(e) => setFormState({...formState, currentRent: Number(e.target.value)})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="e.g., Mumbai" onChange={(e) => setFormState({...formState, city: e.target.value})} required/>
              </div>
              <div>
                <Label htmlFor="neighborhood">Neighborhood</Label>
                <Input id="neighborhood" placeholder="e.g., Bandra West" onChange={(e) => setFormState({...formState, neighborhood: e.target.value})} required/>
              </div>
            </div>
            <div>
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input id="amenities" placeholder="e.g., AC, WiFi, Parking" onChange={(e) => setFormState({...formState, amenities: e.target.value.split(',').map(a => a.trim())})}/>
            </div>
            <Button type="submit" className="w-full btn-gradient-glow" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Suggestion
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="animate-fade-in glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp /> AI Analysis Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-muted rounded-xl">
              <Label>Suggested Monthly Rent</Label>
              <p className="text-4xl font-bold text-primary mt-1">
                {result.suggestedRent.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold flex items-center justify-center gap-2"><BarChart /> Analysis</p>
                 <p className="text-sm text-muted-foreground mt-2">{result.analysis}</p>
              </div>
               <div className="p-4 bg-muted rounded-lg">
                 <p className="text-2xl font-bold flex items-center justify-center gap-2"><BadgePercent /> Confidence</p>
                 <div className="w-full mt-3">
                    <Progress value={result.confidenceScore * 100} className="h-3" />
                    <p className="text-sm font-bold mt-2">{(result.confidenceScore * 100).toFixed(0)}%</p>
                 </div>
              </div>
            </div>
             <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Disclaimer</AlertTitle>
              <AlertDescription>
                This suggestion is generated by an AI and should be used as a guideline. Always consider your own expertise and other market factors.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
