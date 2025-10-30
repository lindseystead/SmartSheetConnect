import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function HeroSection() {
  const scrollToForm = () => {
    const element = document.getElementById("demo-form");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Never Miss a Lead Again
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Automated intake forms that instantly organize leads in Google Sheets and notify your team
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={scrollToForm}
                className="text-base"
                data-testid="button-try-demo"
              >
                Try Demo Form
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={scrollToHowItWorks}
                data-testid="button-see-how-it-works"
              >
                See How It Works
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Trusted by 500+ businesses</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Free to start</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">No credit card</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-lg border bg-card p-8 shadow-lg">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                  <div className="h-24 bg-muted rounded"></div>
                </div>
                <div className="h-12 bg-primary rounded flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">Submit Lead</span>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <ArrowRight className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/10 rounded-lg -z-10"></div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/5 rounded-full -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
