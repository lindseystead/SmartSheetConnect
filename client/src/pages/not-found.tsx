import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 - Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            The page you're looking for doesn't exist. Please check the URL or return to the home page.
          </p>
          <div className="mt-6">
            <a 
              href="/" 
              className="text-sm text-primary hover:underline font-medium"
            >
              Return to Home →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
