import { Card } from "@/components/ui/card";
import { Quote, TrendingUp, Users, Zap } from "lucide-react";

export function SocialProofSection() {
  const stats = [
    {
      icon: Users,
      value: "500+",
      label: "Businesses",
    },
    {
      icon: Zap,
      value: "10k+",
      label: "Leads Captured",
    },
    {
      icon: TrendingUp,
      value: "99.9%",
      label: "Uptime",
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
                "Lifesaver Tech transformed how we handle incoming leads. We went from manually copying data to having everything organized automatically. Our response time improved dramatically."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">JS</span>
                </div>
                <div>
                  <div className="font-semibold">Jessica Martinez</div>
                  <div className="text-sm text-muted-foreground">Operations Manager, TechStart Inc</div>
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
