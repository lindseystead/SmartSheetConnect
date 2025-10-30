import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { leadSubmissionSchema, type LeadSubmission, type LeadSubmissionResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, Loader2 } from "lucide-react";

export function DemoFormSection() {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<LeadSubmission>({
    resolver: zodResolver(leadSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const mutation = useMutation<LeadSubmissionResponse, Error, LeadSubmission>({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/submit-lead", data);
      return await response.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      form.reset();
      setTimeout(() => setIsSuccess(false), 5000);
    },
  });

  const onSubmit = (data: LeadSubmission) => {
    mutation.mutate(data);
  };

  return (
    <section id="demo-form" className="py-20 px-6 bg-muted/30">
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold">
            Try It Now - Submit a Test Lead
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Experience the automation firsthand. We'll show you exactly what happens.
          </p>
        </div>

        <Card className="p-8 md:p-12">
          {isSuccess ? (
            <div className="text-center space-y-6 py-8" data-testid="success-message">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">Thanks! We'll be in touch soon</h3>
                <p className="text-muted-foreground">
                  Your submission has been logged to Google Sheets and our team has been notified.
                </p>
              </div>
              <Button onClick={() => setIsSuccess(false)} data-testid="button-submit-another">
                Submit Another Lead
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium uppercase tracking-wide">
                        Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Smith"
                          {...field}
                          data-testid="input-name"
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium uppercase tracking-wide">
                        Email *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                          data-testid="input-email"
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium uppercase tracking-wide">
                        Phone <span className="text-muted-foreground text-xs normal-case">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          {...field}
                          data-testid="input-phone"
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium uppercase tracking-wide">
                        Message *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your needs..."
                          rows={4}
                          {...field}
                          data-testid="input-message"
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mutation.isError && (
                  <div className="text-sm text-destructive" data-testid="error-message">
                    {mutation.error?.message || "Something went wrong. Please try again."}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full md:w-auto h-12 px-8"
                  disabled={mutation.isPending}
                  data-testid="button-submit"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Lead"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </Card>
      </div>
    </section>
  );
}
