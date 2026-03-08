import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LogOut, Save, ExternalLink } from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  const { data: session, isLoading: sessionLoading } = trpc.admin.verifySession.useQuery();
  const { data: settings } = trpc.admin.getSettings.useQuery();
  const { data: embedCodes } = trpc.admin.getEmbedCodes.useQuery();
  const { data: resourceLinks } = trpc.admin.getResourceLinks.useQuery();
  const { data: socialLinks } = trpc.admin.getSocialLinks.useQuery();
  const { data: quickLinks } = trpc.admin.getQuickLinks.useQuery();

  const [submitDealForm, setSubmitDealForm] = useState("");
  const [contactCalendar, setContactCalendar] = useState("");
  const [mediaPageVisible, setMediaPageVisible] = useState(false);
  const [eventsVisible, setEventsVisible] = useState(false);
  
  const [resources, setResources] = useState<Record<string, string>>({});
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [quickLinksData, setQuickLinksData] = useState<Array<{ id?: number; label: string; url: string }>>([]);

  useEffect(() => {
    if (!sessionLoading && !session?.isAuthenticated) {
      setLocation("/admin");
    }
  }, [session, sessionLoading, setLocation]);

  useEffect(() => {
    if (embedCodes) {
      setSubmitDealForm(embedCodes.find(e => e.type === "submit_deal_form")?.code || "");
      setContactCalendar(embedCodes.find(e => e.type === "contact_calendar")?.code || "");
    }
  }, [embedCodes]);

  useEffect(() => {
    if (settings) {
      setMediaPageVisible(settings.media_page_visible === "true");
      setEventsVisible(settings.events_section_visible === "true");
    }
  }, [settings]);

  useEffect(() => {
    if (resourceLinks) {
      const resourceMap: Record<string, string> = {};
      resourceLinks.forEach(r => {
        resourceMap[r.key] = r.url || "";
      });
      setResources(resourceMap);
    }
  }, [resourceLinks]);

  useEffect(() => {
    if (socialLinks) {
      const socialMap: Record<string, string> = {};
      socialLinks.forEach(s => {
        socialMap[s.platform] = s.url || "";
      });
      setSocials(socialMap);
    }
  }, [socialLinks]);

  useEffect(() => {
    if (quickLinks) {
      setQuickLinksData(quickLinks.map(q => ({ id: q.id, label: q.label, url: q.url || "" })));
    } else {
      setQuickLinksData([
        { label: "GoHighLevel Dashboard", url: "" },
        { label: "Facebook Group Admin", url: "" },
        { label: "Analytics", url: "" },
      ]);
    }
  }, [quickLinks]);

  const logoutMutation = trpc.admin.logout.useMutation({
    onSuccess: () => {
      toast.success("Logged out successfully");
      setLocation("/admin");
    },
  });

  const updateEmbedMutation = trpc.admin.updateEmbedCode.useMutation({
    onSuccess: () => {
      toast.success("Embed code saved");
      utils.admin.getEmbedCodes.invalidate();
    },
  });

  const updateSettingMutation = trpc.admin.updateSetting.useMutation({
    onSuccess: () => {
      toast.success("Setting updated");
      utils.admin.getSettings.invalidate();
    },
  });

  const updateResourcesMutation = trpc.admin.updateResourceLinks.useMutation({
    onSuccess: () => {
      toast.success("Resource links saved");
      utils.admin.getResourceLinks.invalidate();
    },
  });

  const updateSocialsMutation = trpc.admin.updateSocialLinks.useMutation({
    onSuccess: () => {
      toast.success("Social links saved");
      utils.admin.getSocialLinks.invalidate();
    },
  });

  const updateQuickLinksMutation = trpc.admin.updateQuickLinks.useMutation({
    onSuccess: () => {
      toast.success("Quick links saved");
      utils.admin.getQuickLinks.invalidate();
    },
  });

  const handleSaveEmbed = (type: "submit_deal_form" | "contact_calendar", code: string) => {
    updateEmbedMutation.mutate({ type, code });
  };

  const handleToggleSetting = (key: string, value: boolean) => {
    updateSettingMutation.mutate({ key, value: value.toString() });
  };

  const handleSaveResources = () => {
    const resourceArray = [
      { key: "creative_finance_insurance", label: "Creative Finance Insurance", url: resources.creative_finance_insurance || "", displayOrder: 1 },
      { key: "hard_money_lender", label: "Hard Money Lender", url: resources.hard_money_lender || "", displayOrder: 2 },
      { key: "investment_loans", label: "Investment Loans", url: resources.investment_loans || "", displayOrder: 3 },
      { key: "corporation_services", label: "Corporation Services", url: resources.corporation_services || "", displayOrder: 4 },
      { key: "perplexity_pro", label: "Perplexity Pro", url: resources.perplexity_pro || "", displayOrder: 5 },
      { key: "deal_finder_academy", label: "Deal Finder Academy", url: resources.deal_finder_academy || "", displayOrder: 6 },
      { key: "house_hacking_guide", label: "House Hacking Guide", url: resources.house_hacking_guide || "", displayOrder: 7 },
      { key: "hidden_capital_guide", label: "Hidden Capital Guide", url: resources.hidden_capital_guide || "", displayOrder: 8 },
      { key: "facebook_community", label: "Facebook Community", url: resources.facebook_community || "", displayOrder: 9 },
    ];
    updateResourcesMutation.mutate(resourceArray);
  };

  const handleSaveSocials = () => {
    const socialArray = [
      { platform: "facebook" as const, url: socials.facebook || "" },
      { platform: "instagram" as const, url: socials.instagram || "" },
      { platform: "linkedin" as const, url: socials.linkedin || "" },
      { platform: "youtube" as const, url: socials.youtube || "" },
    ];
    updateSocialsMutation.mutate(socialArray);
  };

  const handleSaveQuickLinks = () => {
    const linksArray = quickLinksData.map((link, idx) => ({
      id: link.id,
      label: link.label,
      url: link.url,
      displayOrder: idx + 1,
    }));
    updateQuickLinksMutation.mutate(linksArray);
  };

  if (sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663274333910/BDvsG8QwM5MRn7rkKqLxFL/logo_f73ce9e0.png" alt="Josh Moore" className="h-14 w-auto" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => logoutMutation.mutate()} className="bg-white text-secondary hover:bg-white/90">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container py-8 space-y-8 max-w-6xl">
        {/* Form Code Manager */}
        <Card>
          <CardHeader>
            <CardTitle>Form Embed Codes</CardTitle>
            <CardDescription>Manage HTML/iframe embed codes for forms and calendars</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Submit a Deal Form Embed Code</Label>
              <Textarea
                placeholder="Paste your GoHighLevel form embed code here..."
                value={submitDealForm}
                onChange={(e) => setSubmitDealForm(e.target.value)}
                rows={4}
                className="font-mono text-sm"
              />
              <Button onClick={() => handleSaveEmbed("submit_deal_form", submitDealForm)}>
                <Save className="h-4 w-4 mr-2" />
                Save Form Code
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Contact Calendar Embed Code</Label>
              <Textarea
                placeholder="Paste your calendar embed code here..."
                value={contactCalendar}
                onChange={(e) => setContactCalendar(e.target.value)}
                rows={4}
                className="font-mono text-sm"
              />
              <Button onClick={() => handleSaveEmbed("contact_calendar", contactCalendar)}>
                <Save className="h-4 w-4 mr-2" />
                Save Calendar Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content Visibility Toggles */}
        <Card>
          <CardHeader>
            <CardTitle>Page Visibility Controls</CardTitle>
            <CardDescription>Show or hide pages and sections on your website</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Media Page</Label>
                <p className="text-sm text-muted-foreground">Show Media page in navigation</p>
              </div>
              <Switch
                checked={mediaPageVisible}
                onCheckedChange={(checked) => {
                  setMediaPageVisible(checked);
                  handleToggleSetting("media_page_visible", checked);
                }}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Events Section</Label>
                <p className="text-sm text-muted-foreground">Show Events section on homepage</p>
              </div>
              <Switch
                checked={eventsVisible}
                onCheckedChange={(checked) => {
                  setEventsVisible(checked);
                  handleToggleSetting("events_section_visible", checked);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Links Panel */}
        <Card>
          <CardHeader>
            <CardTitle>External Tools</CardTitle>
            <CardDescription>Quick access links to your external platforms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickLinksData.map((link, idx) => (
              <div key={idx} className="space-y-2">
                <Label>{link.label}</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...quickLinksData];
                      newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                      setQuickLinksData(newLinks);
                    }}
                  />
                  {link.url && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button onClick={handleSaveQuickLinks} className="mt-4">
              <Save className="h-4 w-4 mr-2" />
              Save Quick Links
            </Button>
          </CardContent>
        </Card>

        {/* Resource Links Manager */}
        <Card>
          <CardHeader>
            <CardTitle>Update Resource Links</CardTitle>
            <CardDescription>Manage URLs for the resources page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Creative Finance Insurance</Label>
                <Input
                  placeholder="https://..."
                  value={resources.creative_finance_insurance || ""}
                  onChange={(e) => setResources({ ...resources, creative_finance_insurance: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hard Money Lender</Label>
                <Input
                  placeholder="https://..."
                  value={resources.hard_money_lender || ""}
                  onChange={(e) => setResources({ ...resources, hard_money_lender: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Investment Loans</Label>
                <Input
                  placeholder="https://..."
                  value={resources.investment_loans || ""}
                  onChange={(e) => setResources({ ...resources, investment_loans: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Corporation Services</Label>
                <Input
                  placeholder="https://..."
                  value={resources.corporation_services || ""}
                  onChange={(e) => setResources({ ...resources, corporation_services: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Perplexity Pro</Label>
                <Input
                  placeholder="https://..."
                  value={resources.perplexity_pro || ""}
                  onChange={(e) => setResources({ ...resources, perplexity_pro: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Deal Finder Academy</Label>
                <Input
                  placeholder="https://..."
                  value={resources.deal_finder_academy || ""}
                  onChange={(e) => setResources({ ...resources, deal_finder_academy: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>House Hacking Guide</Label>
                <Input
                  placeholder="https://..."
                  value={resources.house_hacking_guide || ""}
                  onChange={(e) => setResources({ ...resources, house_hacking_guide: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hidden Capital Guide</Label>
                <Input
                  placeholder="https://..."
                  value={resources.hidden_capital_guide || ""}
                  onChange={(e) => setResources({ ...resources, hidden_capital_guide: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Facebook Community</Label>
                <Input
                  placeholder="https://..."
                  value={resources.facebook_community || ""}
                  onChange={(e) => setResources({ ...resources, facebook_community: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSaveResources} className="mt-4">
              <Save className="h-4 w-4 mr-2" />
              Save All Links
            </Button>
          </CardContent>
        </Card>

        {/* Social Media Manager */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>Update social media URLs for footer and contact page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input
                  placeholder="https://facebook.com/..."
                  value={socials.facebook || ""}
                  onChange={(e) => setSocials({ ...socials, facebook: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input
                  placeholder="https://instagram.com/..."
                  value={socials.instagram || ""}
                  onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  placeholder="https://linkedin.com/in/..."
                  value={socials.linkedin || ""}
                  onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>YouTube</Label>
                <Input
                  placeholder="https://youtube.com/@..."
                  value={socials.youtube || ""}
                  onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSaveSocials} className="mt-4">
              <Save className="h-4 w-4 mr-2" />
              Save Social Links
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
