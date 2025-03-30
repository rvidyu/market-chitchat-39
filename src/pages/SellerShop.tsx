
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { MessageSquare, Store } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

interface ContactFormValues {
  subject: string;
  message: string;
}

const SellerShop = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Only sellers should have a shop page
  if (user?.role !== "seller") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                <Store className="h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Seller Shop Not Found</h2>
                <p className="text-gray-500 mb-4">
                  You need to be logged in as a seller to view your shop profile.
                </p>
                <Button onClick={() => navigate("/")}>Return Home</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Contact form handling
  const form = useForm<ContactFormValues>({
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    toast({
      title: "Message sent",
      description: "Your message has been sent to the seller.",
    });
    setOpen(false);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto p-4">
        <Card className="mb-8">
          <CardHeader className="bg-messaging-primary text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold flex items-center">
                <Store className="mr-2 h-6 w-6" /> Seller Shop Profile
              </h1>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Shop Avatar */}
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="w-48 h-48 rounded-full bg-messaging-secondary flex items-center justify-center overflow-hidden border-4 border-messaging-primary">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=200`} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Shop Details */}
              <div className="w-full md:w-2/3">
                <h2 className="text-3xl font-bold text-messaging-primary mb-2">{user.name}'s Shop</h2>
                <div className="mb-4 text-messaging-muted">
                  <p>Seller since {new Date().toLocaleDateString()}</p>
                  <p>Contact: {user.email}</p>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">About the Shop</h3>
                <p className="mb-4">
                  Welcome to my handmade and vintage shop! I specialize in creating unique, 
                  one-of-a-kind items made with love and care. Browse my collection and feel 
                  free to reach out if you have any questions.
                </p>
                
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-messaging-primary hover:bg-messaging-accent">
                      <MessageSquare className="mr-2 h-4 w-4" /> Contact Seller
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Contact {user.name}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="What is this regarding?" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Write your message here..." 
                                  className="min-h-[150px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-messaging-primary hover:bg-messaging-accent">
                            Send Message
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="w-full">
              <h3 className="text-xl font-semibold mb-4">Shop Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-messaging-primary">42</p>
                  <p className="text-sm text-gray-600">Items Sold</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-messaging-primary">4.8</p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-messaging-primary">18</p>
                  <p className="text-sm text-gray-600">Products</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-messaging-primary">36</p>
                  <p className="text-sm text-gray-600">Reviews</p>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default SellerShop;
