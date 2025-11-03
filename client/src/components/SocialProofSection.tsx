import { Card } from "@/components/ui/card";
import { Quote, TrendingUp, Users, Zap } from "lucide-react";

export function SocialProofSection() {
  const stats = [
    {
      icon: Users,
      value: "100%",
      label: "Automated",
    },
    {
      icon: Zap,
      value: "Instant",
      label: "Notifications",
    },
    {
      icon: TrendingUp,
      value: "24/7",
      label: "Availability",
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Card className="p-8 md:p-12">
            <div className="space-y-6">
              <Quote className="w-10 h-10 text-primary" />
              <p className="text-lg italic leading-relaxed">
                "SmartSheetConnect completely transformed our lead management process. We went from manually copying form submissions to having everything automatically organized in Google Sheets. Our team response time improved dramatically, and we never miss a lead anymore."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">SM</span>
                </div>
                <div>
                  <div className="font-semibold">Sarah Mitchell</div>
                  <div className="text-sm text-muted-foreground">Operations Manager</div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="p-6 text-center hover-elevate transition-all duration-200"
                data-testid={`stat-${index}`}
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-4xl font-bold">{stat.value}</div>
                  <div className="text-sm uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
