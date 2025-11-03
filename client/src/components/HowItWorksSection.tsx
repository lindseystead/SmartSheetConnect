import { FileText, Database, Mail } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: FileText,
      title: "Customer Submits Form",
      description: "A potential customer fills out your professional lead capture form with their contact information, needs, and message.",
    },
    {
      number: "02",
      icon: Database,
      title: "Automatically Logs to Google Sheets",
      description: "The submission is instantly recorded in your Google Sheets spreadsheet with full details, timestamps, and automatic spreadsheet creation if needed.",
    },
    {
      number: "03",
      icon: Mail,
      title: "Your Team Gets Notified Instantly",
      description: "Your team receives immediate email and Slack notifications with all lead details, enabling fast response times and never missing an opportunity.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-semibold">
                How It Works
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                A streamlined, automated workflow that ensures your team never misses a lead and can respond instantly
              </p>
            </div>

            <div className="space-y-8">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className="flex gap-6"
                  data-testid={`step-${index}`}
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary/10 rounded-md flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-bold text-muted-foreground/20">
                        {step.number}
                      </span>
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="space-y-4">
              <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">Form Submission</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span>John Smith</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>john@example.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-primary font-medium">New Lead</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">Google Sheets</span>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Date</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>John Smith</div>
                    <div className="truncate">john@ex...</div>
                    <div>Today</div>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">Email Notification</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">New Lead: John Smith</p>
                  <p>You have a new lead submission...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
