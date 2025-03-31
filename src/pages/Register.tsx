
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["buyer", "seller"], {
    required_error: "Please select a role",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

const Register = () => {
  const { register: registerUser, loading } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "buyer",
    },
  });

  const onSubmit = async (data: FormData) => {
    await registerUser(data.name, data.email, data.password, data.role);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-messaging-primary/10 p-3 rounded-full">
              <UserPlus className="h-6 w-6 text-messaging-primary" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-6">Create your account</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>I want to...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="buyer" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Shop for handmade & vintage items (Buyer)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="seller" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Sell my handmade or vintage items (Seller)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center text-sm text-gray-500 mt-4">
                Already have an account?{" "}
                <Link to="/login" className="text-messaging-primary hover:underline">
                  Log in
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;
