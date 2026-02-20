import { useState } from "react";
import { useAuth, useAdminLogin } from "../hooks/use-auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { useLocation } from "wouter";
import { Lock, Phone, Shield } from "lucide-react";

export default function Login() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [mobile, setMobile] = useState("9999999999");
  const [password, setPassword] = useState("admin123");
  const [otp, setOtp] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const adminLogin = useAdminLogin();
  // sendOtp and verifyOtp are only used for student flows; admin uses the admin-login API

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (user) {
    setLocation(user.role === 'admin' ? '/shop' : '/menu');
    return null;
  }

  const handleSendOtp = async () => {
    if (!mobile || !password) {
      toast({ title: "Error", description: "Please enter mobile and password", variant: "destructive" });
      return;
    }

    try {
      setIsLoggingIn(true);
      const resp: any = await adminLogin.mutateAsync({ mobile, password });
      // backend returns otpRequired when it has sent an OTP
      if (resp.otpRequired) {
        toast({ title: "Success", description: "OTP sent to your mobile (Demo: " + resp.otp + ")" });
        setStep("otp");
      } else {
        // login complete without OTP (unlikely)
        toast({ title: "Welcome Admin!", description: "Login successful" });
        setLocation('/shop');
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Invalid credentials", variant: "destructive" });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast({ title: "Error", description: "Please enter OTP", variant: "destructive" });
      return;
    }
    try {
      setIsLoggingIn(true);
      await adminLogin.mutateAsync({ mobile, password, otp });
      toast({ title: "Welcome Admin!", description: "Login successful" });
      setLocation('/shop');
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Invalid OTP", variant: "destructive" });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src="/ambis-cafe-logo.png" 
              alt="Ambi's Cafe" 
              className="w-24 h-24 drop-shadow-lg"
            />
          </div>
          <h1 className="font-bold text-4xl text-black">Ambi's Cafe</h1>
          <h2 className="font-bold text-2xl text-black mt-2">Admin Dashboard</h2>
          <p className="text-muted-foreground mt-2 font-medium">Manage your cafe operations</p>
        </div>

        <Card className="bg-white border-yellow-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-6 w-6 text-yellow-600" />
              {step === "credentials" ? "Credentials" : "Verify OTP"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "credentials" && (
              <>
                <div className="bg-yellow-100 border border-yellow-300 p-3 rounded-lg text-sm">
                  <span className="font-bold text-yellow-900">Demo Credentials:</span>
                  <div className="text-yellow-900 text-xs mt-1">Mobile: 9999999999</div>
                  <div className="text-yellow-900 text-xs">Password: admin123</div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Mobile Number
                  </Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="9999999999"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="border-yellow-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-yellow-200"
                  />
                </div>

                <Button 
                  onClick={handleSendOtp}
                  disabled={isLoggingIn}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold h-10"
                >
                  {isLoggingIn ? "Verifying..." : "Send OTP"}
                </Button>
              </>
            )}

            {step === "otp" && (
              <>
                <div className="bg-yellow-100 border border-yellow-300 p-3 rounded-lg text-sm text-center">
                  <span className="font-bold text-yellow-900">OTP sent to 9999999999</span>
                  <div className="text-yellow-900 text-xs mt-1">Demo OTP: 123456</div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Enter OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="border-yellow-200 text-center text-2xl tracking-widest"
                  />
                </div>

                <Button 
                  onClick={handleVerifyOtp}
                  disabled={isLoggingIn}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold h-10"
                >
                  {isLoggingIn ? "Verifying..." : "Verify OTP"}
                </Button>

                <Button 
                  onClick={() => {
                    setStep("credentials");
                    setOtp("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Back
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>© 2026 Ambi's Cafe. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
              