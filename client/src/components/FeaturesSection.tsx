import { Sheet, Bell, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

export function FeaturesSection() {
  const features = [
    {
      icon: Sheet,
      title: "Automatic Google Sheets Logging",
      description: "Every lead submission is instantly added to your Google Sheets spreadsheet with timestamps and all details. Auto-creates spreadsheets with organization-specific naming.",
      detail: "Zero manual data entry",
    },
    {
      icon: Bell,
      title: "Instant Email Notifications",
      description: "Receive immediate email alerts via Gmail API when a new lead is submitted. Includes all lead details and a direct link to view in Google Sheets.",
      detail: "Never miss an opportunity",
    },
    {
      icon: MessageSquare,
      title: "Slack Team Notifications",
      description: "Keep your entire team informed with rich, formatted Slack notifications. Includes lead details and quick access buttons for fast response.",
      detail: "Real-time team coordination",
    },
  ];

  return (
    <section id="features" className="py-20 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold">
            Everything You Need to Capture and Manage Leads
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful automation that works seamlessly with Google Sheets, Gmail, and Slack - the tools your team already uses every day
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-8 hover-elevate transition-all duration-200"
              data-testid={`card-feature-${index}`}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <p className="text-sm text-primary font-medium">
                    {feature.detail}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
