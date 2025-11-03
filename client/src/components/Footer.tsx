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
              <span className="text-lg font-semibold">SmartSheetConnect</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional lead capture system that automatically logs submissions to Google Sheets and sends instant notifications to your team.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                asChild
                data-testid="button-social-github"
              >
                <a 
                  href="https://github.com/lindseystead" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                >
                  <SiGithub className="w-5 h-5" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                asChild
                data-testid="button-social-twitter"
              >
                <a 
                  href="https://x.com/lindseystead" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="X (Twitter) Profile"
                >
                  <SiX className="w-5 h-5" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                asChild
                data-testid="button-social-linkedin"
              >
                <a 
                  href="https://linkedin.com/in/lindseystead" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                >
                  <SiLinkedin className="w-5 h-5" />
                </a>
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
                data-testid="button-footer-how-it-works"
              >
                How It Works
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start px-0 h-auto"
                onClick={() => scrollToSection("demo-form")}
                data-testid="button-footer-contact"
              >
                Contact Us
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start px-0 h-auto"
                asChild
                data-testid="button-footer-github"
              >
                <a 
                  href="https://github.com/lindseystead" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <p className="text-sm text-muted-foreground">
              Professional lead capture automation for businesses that value efficiency and never missing an opportunity.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a 
                href="https://github.com/lindseystead" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View on GitHub
              </a>
              <a 
                href="https://linkedin.com/in/lindseystead" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>© 2025 SmartSheetConnect. All rights reserved.</div>
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
