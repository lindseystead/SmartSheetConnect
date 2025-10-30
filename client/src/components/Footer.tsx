import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap } from "lucide-react";
import { SiGithub, SiX, SiLinkedin } from "react-icons/si";

export function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Lifesaver Tech</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Automated intake forms that help businesses capture and organize leads effortlessly.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" data-testid="button-social-github">
                <SiGithub className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-social-twitter">
                <SiX className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-social-linkedin">
                <SiLinkedin className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Button 
                variant="ghost" 
                className="justify-start px-0 h-auto"
                onClick={() => scrollToSection("features")}
                data-testid="button-footer-features"
              >
                Features
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start px-0 h-auto"
                onClick={() => scrollToSection("how-it-works")}
                data-testid="button-footer-pricing"
              >
                Pricing
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start px-0 h-auto"
                data-testid="button-footer-docs"
              >
                Documentation
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start px-0 h-auto"
                data-testid="button-footer-support"
              >
                Support
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Get the latest updates and tips delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="h-10"
                data-testid="input-newsletter"
              />
              <Button data-testid="button-subscribe">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>© 2025 Lifesaver Tech. All rights reserved.</div>
          <div className="flex gap-6">
            <button className="hover-elevate rounded px-2 py-1" data-testid="link-privacy">
              Privacy Policy
            </button>
            <button className="hover-elevate rounded px-2 py-1" data-testid="link-terms">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
