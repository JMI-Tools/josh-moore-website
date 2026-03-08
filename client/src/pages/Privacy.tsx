import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20">
        <div className="container max-w-4xl space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold">Information Collection</h2>
              <p className="text-muted-foreground">
                We collect information you provide directly to us when you submit a deal, contact us, or interact with our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold">Use of Information</h2>
              <p className="text-muted-foreground">
                We use the information we collect to respond to your inquiries, evaluate potential deals, and provide you with information about our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold">Information Sharing</h2>
              <p className="text-muted-foreground">
                We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties without your consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us through the contact form on our website.
              </p>
            </section>

            <p className="text-sm text-muted-foreground pt-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
