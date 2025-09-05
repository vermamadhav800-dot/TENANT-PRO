
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BrainCircuit, LoaderCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { askTenantAssistant } from '@/ai/flows/tenant-assistant-flow';
import AppLogo from './AppLogo';

export default function TenantAiAssistant({ tenant, appState }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello ${tenant.name}! I'm Flow, your personal AI assistant. How can I help you today? You can ask me about your rent, due dates, property rules, or how to submit a request.` },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askTenantAssistant({
        query: input,
        tenantData: {
          name: tenant.name,
          unitNo: tenant.unitNo,
          rentAmount: tenant.rentAmount,
          dueDate: tenant.dueDate,
          leaseStartDate: tenant.leaseStartDate,
          leaseEndDate: tenant.leaseEndDate,
        },
        propertyData: {
          propertyName: appState.defaults.propertyName,
          propertyAddress: appState.defaults.propertyAddress,
          upiId: appState.defaults.upiId,
        },
        ownerName: appState.MOCK_USER_INITIAL.name,
      });

      const assistantMessage = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col glass-card">
      <CardHeader className="flex flex-row items-center gap-4">
        <AppLogo className="w-12 h-12" iconClassName="w-7 h-7" />
        <div>
          <CardTitle className="text-2xl font-bold font-headline gradient-text">AI Assistant</CardTitle>
          <CardDescription>Your personal guide to everything about your tenancy.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-0">
        <ScrollArea className="flex-1 p-4 pr-6">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn('flex items-start gap-3', {
                  'justify-end': message.role === 'user',
                })}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback>
                        <BrainCircuit />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-md rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted/80 rounded-bl-none'
                  )}
                >
                  {message.content}
                </div>
                 {message.role === 'user' && (
                   <Avatar className="w-8 h-8 border">
                    <AvatarImage src={tenant.profilePhotoUrl} alt={tenant.name} />
                    <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                 <Avatar className="w-8 h-8 border">
                    <AvatarFallback>
                        <BrainCircuit />
                    </AvatarFallback>
                  </Avatar>
                <div className="bg-muted/80 rounded-2xl px-4 py-3 rounded-bl-none flex items-center gap-2">
                    <LoaderCircle className="w-4 h-4 animate-spin"/>
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your rent, rules, or requests..."
              className="pr-12 h-12 text-base"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 btn-gradient-glow"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
