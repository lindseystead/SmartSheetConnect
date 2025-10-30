import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export function Header() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2"
          data-testid="button-logo"
        >
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Lifesaver Tech</span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          <Button 
            variant="ghost" 
            onClick={() => scrollToSection("features")}
            data-testid="button-nav-features"
          >
            Features
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => scrollToSection("how-it-works")}
            data-testid="button-nav-how-it-works"
          >
            How It Works
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => scrollToSection("demo-form")}
            data-testid="button-nav-contact"
          >
            Contact
          </Button>
        </nav>

        <Button 
          onClick={() => scrollToSection("demo-form")}
          data-testid="button-get-started"
        >
          Get Started
        </Button>
      </div>
    </header>
  );
}
