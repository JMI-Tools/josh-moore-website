import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SubmitDeal() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20">
        <div className="container max-w-4xl space-y-12">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Submit Your Deal</h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Have a deal that fits my criteria? Submit the details below and let's create a win-win situation.
            </p>
          </div>

          {/* Form Embed */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <iframe
              src="https://api.robonurture.com/widget/form/GNiBp84f1vlRISY5xEDg"
              style={{width: "100%", height: "1047px", border: "none", borderRadius: "3px"}}
              id="inline-GNiBp84f1vlRISY5xEDg"
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="Website Deal Intake Form"
              data-layout-iframe-id="inline-GNiBp84f1vlRISY5xEDg"
              data-form-id="GNiBp84f1vlRISY5xEDg"
              title="Website Deal Intake Form"
            />
            <script src="https://api.robonurture.com/js/form_embed.js"></script>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
