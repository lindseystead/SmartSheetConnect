import { Sheet, Bell, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

export function FeaturesSection() {
  const features = [
    {
      icon: Sheet,
      title: "Instant Google Sheets Logging",
      description: "Every submission is automatically added to your spreadsheet in real-time. No manual data entry required.",
      detail: "Auto-sync to spreadsheets",
    },
    {
      icon: Bell,
      title: "Real-Time Email Alerts",
      description: "Get notified immediately when a new lead comes in. Never let an opportunity slip through the cracks.",
      detail: "Never miss a notification",
    },
    {
      icon: MessageSquare,
      title: "Slack Integration",
      description: "Keep your entire team in the loop with instant Slack notifications for every new submission.",
      detail: "Team coordination made easy",
    },
  ];

  return (
    <section id="features" className="py-20 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold">
            Everything You Need to Capture Leads
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful automation that works seamlessly with the tools you already use
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
