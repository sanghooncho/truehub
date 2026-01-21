import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://truehub.previewapp.co.kr";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/tester/my/",
          "/tester/submit/",
          "/tester/rewards/",
          "/tester/settings/",
          "/tester/giftshop/",
          "/advertiser/dashboard/",
          "/advertiser/campaigns/",
          "/advertiser/credits/",
          "/advertiser/settings/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
