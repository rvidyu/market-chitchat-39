
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof formSchema>;

const Login = () => {
  const { login, loading } = useAuth();
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    await login(data.email, data.password);
  };

  const handleDemoLogin = (email: string, password: string) => {
    form.setValue("email", email);
    form.setValue("password", password);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-messaging-primary/10 p-3 rounded-full">
              <LogIn className="h-6 w-6 text-messaging-primary" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-6">Log in to your account</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-messaging-primary hover:bg-messaging-accent" 
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log in'}
              </Button>

              <div className="text-center text-sm text-gray-500 mt-4">
                Don't have an account?{" "}
                <Link to="/register" className="text-messaging-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </form>
          </Form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              className="w-full text-sm" 
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            >
              {showDemoAccounts ? "Hide Demo Accounts" : "Show Demo Accounts"}
            </Button>
            
            {showDemoAccounts && (
              <div className="mt-4 space-y-2">
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium">Buyer Account</p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-xs text-messaging-primary"
                      onClick={() => handleDemoLogin("buyer@example.com", "password")}
                    >
                      Use this account
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Email: buyer@example.com</p>
                  <p className="text-xs text-gray-500">Password: password</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium">Seller Account</p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-xs text-messaging-primary"
                      onClick={() => handleDemoLogin("seller@example.com", "password")}
                    >
                      Use this account
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Email: seller@example.com</p>
                  <p className="text-xs text-gray-500">Password: password</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
