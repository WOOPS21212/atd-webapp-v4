// Questions data structure
const questionSections = [
  {
    title: "1. Strategy",
    page: 151,
    questions: [
      "How do you tailor your advertising strategies to align with specific business goals and target audiences?",
      "Can you provide examples of successful campaigns where your strategic approach significantly impacted the client's market presence or sales performance?",
      "What is your process for developing a comprehensive brand, PR, thought leadership strategies for a B2B company?",
      "How do you balance short-term tactics with long-term strategy and planning?",
      "What is your team's strategy to immerse into a brand's identity to successfully provide additional strategies that complement the current brand identity?"
    ]
  },
  {
    title: "2. Innovation",
    page: 179,
    questions: [
      "How do you foster a culture of innovation within your team to consistently bring fresh, creative ideas to your campaigns?",
      "Can you share an example of an innovative campaign you've executed recently, and how it stood out from traditional advertising methods?",
      "Can you share examples of your most innovative brand and PR campaigns to stand out in a crowded and commoditized market?",
      "How do you stay ahead of industry trends and ensure that your strategies and campaigns remain fresh and innovative?"
    ]
  },
  {
    title: "3. Technology",
    page: 210,
    questions: [
      "How do you leverage advanced technologies, such as artificial intelligence and data analytics, to enhance your advertising strategies and campaigns?",
      "Can you discuss the tools and platforms you use for tracking and measuring the performance of your campaigns, and how they contribute to optimizing results?",
      "Can you provide examples of how technology has improved the results of your brand, PR, and/or paid media campaigns?",
      "What technology or tools do you use to enhance your strategies, monitor and analyze earned media coverage, and track campaign performance?",
      "Please be specific in regards to the tools below: a. Analytics platforms b. Social media management c. Email marketing software d. Project management systems",
      "Do you have a proprietary dashboard that combines all paid media metrics into one view? If so, what API connections do you have and can you share a preview of the dashboard?",
      "Can you provide a few examples where you have used artificial intelligence to enhance your advertising strategy?",
      "What is your experience with designing and managing automated email workflows in HubSpot? Can you provide examples of campaigns that included lead nurturing, re-engagement, or behavior-triggered emails?",
      "How do you ensure data integrity and seamless syncing when integrating HubSpot with other platforms (e.g., Salesforce, eCommerce systems, paid media platforms, or custom APIs)?",
      "How do you approach contact segmentation and list management in HubSpot to support highly targeted, personalized campaigns across B2B and B2C audiences?",
      "What performance metrics do you track and report on for HubSpot email campaigns? How do you use these insights to optimize future workflows?",
      "Describe your QA process for testing workflows and email campaigns in HubSpot."
    ]
  },
  {
    title: "4. Content",
    page: 244,
    questions: [
      "What does your content creation process, from ideation to execution, look like and can you explain how each stage ensures the final product aligns with our brand voice and objectives?",
      "How do you collaborate with clients during the content creation process to ensure that their feedback is incorporated efficiently and effectively?",
      "Can you share examples of content marketing campaigns for B2B companies?",
      "What is your process for developing content, messaging, and brand narratives for clients?",
      "What companies (provide current examples) have you managed social media for including strategy development, content development and community management. These should include other companies outside of ATD/HTR if applicable.",
      "Can you provide a few examples of innovative content created for a client and metrics of how it performed?",
      "Can you share an example of content created for a client that the client did not decide to incorporate into their strategies and why that decision was made?"
    ]
  },
  {
    title: "5. Advertising / SEM / SEO",
    page: 269,
    questions: [
      "What specific advertising tactics do you find most effective for engaging and converting target audiences, and how do you determine which tactics to use for each campaign?",
      "Can you share an example of a multi-channel advertising campaign you've executed, highlighting the tactics used across different channels and the overall results?",
      "How do you integrate PR and thought leadership efforts with advertising or marketing campaigns to ensure a cohesive brand message?",
      "Can you provide examples of how you have successfully blended brand reputation and PR with advertising strategies for a unified approach?",
      "What marketing avenues do you have experience in and how large are the teams that support each avenue (i.e. Search Engine Marketing, Organic and Paid Social Media, etc). If yes, can you provide a few examples of where you have organically grown a brand's social channels, and the strategy used to grow it? Can you also provide any examples of other customers in the automotive space whose SEM you have successfully performed?",
      "Do you have any experience in Social Influencing space? If yes, what is your process to connecting brands with influencers that will benefit their brands? Can you share an example of a successful influencer & brand partnership?",
      "How would your agency build and execute an integrated paid media and SEO strategy to support omnichannel conversion paths for both B2B and B2C segments?",
      "How do you conduct technical SEO audits, and what are your standard processes for resolving issues like redirects, canonicalization, and crawlability?",
      "What strategies would you use to improve non-branded keyword visibility and CTR, especially on low-performing but high intent terms (like 'commercial truck tires near me')?",
      "How does your agency ensure continuous content optimization based on monthly SEO performance (sessions, engagement rate, keyword rankings, etc.)?",
      "What is your methodology for selecting and optimizing paid search keywords for both branded and non-branded campaigns, and how do you mitigate low CTRs in competitive terms?",
      "Describe how you track and optimize for lead-driving behaviors such as 'Find a Dealer' and 'Search by Size.' How do you assign value across conversions?",
      "What platforms, tools, and benchmarks do you use to manage audience segmentation and retargeting?",
      "How does your agency monitor competitor SEO/PPC activity, and how do you apply those insights to enhance campaign performance?",
      "Do you have any experience with Search Engine Marketing in house or do you outsource it? Can you provide a proof of concept with Search Engine Marketing? What are typical keywords you would include in an automotive industry SEM campaign?",
      "How do you track success on Search Engine Marketing campaigns? What benchmarks do you have by industry for this type of campaign and what does your 'warm-up period' typically look like when you first start these campaigns?",
      "What is your optimization strategy for Search Engine Marketing? Are you optimizing daily, weekly, monthly, quarterly?",
      "What is your management fee on Search Engine Marketing Campaigns? Is this scalable with the addition of individual franchise marketing campaigns? If so, what management fee would they have?"
    ]
  },
  {
    title: "6. Web",
    page: 329,
    questions: [
      "What web/online marketing strategies do you employ to increase brand visibility and drive traffic to our website, and how do you tailor these strategies to fit our specific industry?",
      "How do you measure and analyze the success of your web/online marketing campaigns, and what key performance indicators (KPIs) do you focus on to ensure continuous improvement?",
      "What is the content, SEO, and technical capabilities of your in-house digital team?",
      "Can you share examples of how you have leveraged a client's website to drive lead generation?",
      "Do you handle web design and development in-house, or do you work with external partners?",
      "Can you share examples of websites you've managed or created?",
      "Can you share an example of an eCommerce website you built and manage, how you optimize the site for performance, and metrics for the site?",
      "Is your staff able to fully support our branded sites — preventative maintenance, edits via CMS access as needed, hosting and API integrations to pull product data from ATD systems? Are you doing this today for any clients soup to nuts?",
      "What is your approach to designing and optimizing guided product discovery tools (like a Tire Finder) that incorporate visual icons, filters, and user intent-based search (e.g., seasonal, off-road)?",
      "How do you approach the integration of social proof and reviews into high-intent pages like product detail pages (PDPs) and the homepage? Can you provide an example?",
      "What is your experience implementing scroll-triggered or interactive content modules (e.g., parallax, sticky banners, animation fades), and how do you balance these with accessibility and performance?",
      "How do you incorporate lead generation into UX without disrupting flow — specifically email capture, promos, or tools like 'Find a Dealer' and 'Get Tire Tips'?",
      "What is your agency's approach to upgrading dealer locator tools to include interactive maps, service filters, and geo-personalization for B2C users?",
      "How do you validate design decisions using user behavior data (e.g., scroll depth, click maps, bounce rates)? Can you describe a project where you improved engagement using heatmap insights?"
    ]
  },
  {
    title: "7. Events",
    page: 368,
    questions: [
      "Can you provide examples of successful corporate events and travel arrangements you've managed recently, and highlight the impact these had on client satisfaction and business outcomes?",
      "How do you optimize budget allocations for corporate events and travel arrangements to ensure cost-effectiveness without compromising on the uniqueness and quality of the experience?",
      "What is your process for planning events and the guest experience that help elevate a brand's reputation, lasting impressions, and brand engagement?",
      "What is your experience in planning and executing PR-driven events, such as product launches, press conferences, site visits/tours, or grand openings?",
      "Do you have a full in-house events team that would be able to do pre, and post event?",
      "What software and technology do you have to make events run smoothly? (i.e. Registration sites, mobile applications, etc.)"
    ]
  },
  {
    title: "8. Public Relations",
    page: 391,
    questions: [
      "Can you explain your media relations approach?",
      "Can you provide examples of successful PR campaigns you've managed for clients in our industry, and what measurable outcomes were achieved?",
      "Can you outline your process for setting measurable goals and KPIs for PR campaigns that drive business goals (i.e. increased sales)?",
      "How do you incorporate digital media, social media, owned channels, and paid media into your PR plans?"
    ]
  },
  {
    title: "9. Crisis Management",
    page: 418,
    questions: [
      "How do you approach crisis management, and can you share a case study where your strategy successfully mitigated a PR crisis?",
      "Can you describe your process for managing a media relations crisis, including how you communicate with stakeholders and the media to control the narrative and minimize damage to our brand?",
      "How do you work with clients to maintain and update their crisis communications plan, messaging templates, and scenario checklists? What processes do you follow when preparing and responding to varying types of crises (i.e. vehicle accident, OSHA violations, labor relations, theft, natural disaster, cybersecurity, active shooter, etc.)?",
      "How do you approach managing and protecting a brand's reputation, particularly in times of negative publicity or controversy?",
      "How do you monitor and respond to potential threats or negative comments about a brand across media and social media?"
    ]
  },
  {
    title: "10. Production",
    page: 448,
    questions: [
      "Can you share examples of how you've utilized cutting-edge technology or innovative techniques in your media production projects, and what impact these had on the final product?",
      "How do you ensure that projects are delivered on time and within budget, and can you share a case where you successfully managed a challenging timeline or budget constraint?",
      "Do you outsource production work? If yes, what determines what will be outsourced vs handled by internal team?",
      "What is the print, photo, video production and press kit or other media asset capabilities of your in-house team?",
      "Can you provide examples of low and high-quality content (i.e. videos, branded content, multimedia assets, etc.) that you've produced for other clients?",
      "Can you manage production of end-slate addition for our franchisees for commercials that we would need to add their store details onto? If yes, what would the cost associated be?"
    ]
  },
  {
    title: "11. Management Fee and Additional Fee",
    page: 485,
    questions: [
      "Can you provide a detailed breakdown of your management fees, including what services are covered under these fees and any potential additional costs we should be aware of?",
      "How do you handle rush projects, and what are the associated rush fees? Can you provide an example of a past rush project and how the fees were structured?",
      "How do you handle budgeting and cost estimations for projects?",
      "Are there any additional costs or fees that could arise beyond the commercial scope of work fees?",
      "How do you prioritize budget allocation across PR, thought leadership, and paid media activities?",
      "Do you operate on a monthly retainer basis or on a management fee, depending on the services?",
      "What is your management fee for media buying for TV spots and does this fee vary by media type (ie. SEM, Social, etc)?"
    ]
  },
  {
    title: "12. Account Management",
    page: 485,
    questions: [
      "How many client accounts does an account manager oversee?",
      "How many accounts does your company currently manage?",
      "What is the size of the team that will be dedicated to our account and what are their roles?",
      "How do you keep clients involved in the process and ensure regular communication?",
      "How do you handle feedback and revisions?",
      "How would you describe your agency's culture and approach to client relationships?",
      "What is the average timeline for developing and executing an integrated owned, earned, paid media campaign from start to finish?"
    ]
  },
  {
    title: "13. Reporting & Analytics",
    page: 506,
    questions: [
      "How often will we receive reports and what is included in them?",
      "Do you provide both quantitative and qualitative analysis (i.e. interpret the data and offer actionable insights)?",
      "What tools do you use for data analysis and reporting?",
      "What kind of trends or predictive analysis do you offer to forecast future performance?",
      "How do you track and measure ROI?",
      "What metrics do you typically track and report on?",
      "How do you customize reporting to fit varying business objectives and needs?"
    ]
  },
  {
    title: "14. Team & Chemistry / Culture",
    page: 528,
    questions: [
      "Who will be on our core account team, and what are their roles and backgrounds?",
      "How do you ensure strong internal collaboration among your team members?",
      "What are your core values, and how do they influence the way you work?",
      "Can you describe your ideal client-agency relationship?",
      "I think this is going to be hard to assess with a question honestly, everyone will answer positively; Get a few references."
    ]
  },
  {
    title: "15. SME Representation (PR, Social, Strategy) / Not just pitch person",
    page: 541,
    questions: [
      "What is your internal process for aligning PR, content, social media, and creative teams around SME priorities?",
      "Can you provide an example of a multi-department campaign where SMEs played a central role?",
      "How do you onboard and familiarize internal teams with our SMEs' areas of expertise and communication styles?",
      "What strategies do you use to avoid message dilution or contradiction when multiple teams are involved?",
      "The next time we regroup with the agency partner we want the team/person who is actually developing or the content and strategy to be part of the discussion, probably when we give them a project or specific task.",
      "How often would the SME meet with the team outside of the Account Manager (ex. Social team vs Account management)?"
    ]
  },
  {
    title: "16. Social Media",
    page: 558,
    questions: [
      "Who are some of your current and past clients in our industry (or similar industries)?",
      "How do you approach building a social media strategy?",
      "Do you provide content creation services (graphics, video, copywriting, etc.)?",
      "How do you stay updated on social media trends and algorithm changes?",
      "How do you integrate paid and organic strategies?",
      "Can you provide a sample content calendar or workflow?",
      "What key performance indicators (KPIs) do you track?",
      "How does your agency develop and execute a robust social media strategy that aligns with both B2C and B2B business goals?",
      "Please provide an example of a multi-channel campaign you've managed that successfully increased both awareness and lead generation. What KPIs were met?",
      "What is your approach to content creation across platforms with varying formats and tones (e.g., TikTok vs. LinkedIn), and how do you maintain brand consistency?",
      "How do you plan, execute, and optimize paid social media campaigns to meet specific goals like audience growth, lead generation, and conversion?",
      "Describe your community management process. How do you ensure timely, brand-aligned responses across multiple platforms?",
      "How does your team stay on top of emerging trends in content, algorithms, and engagement to keep your strategies fresh and competitive?",
      "What tools or platforms do you use for content scheduling, social automation, and reporting? How do these tools help optimize engagement?",
      "Share a sample of your standard monthly and quarterly performance reporting. How do you use data to improve performance and inform recommendations?",
      "What is your experience executing paid and organic social media campaigns in both the U.S. and Canada? How do you approach localization for each market?",
      "How do you collaborate with internal client teams (e.g., creative, PR, sales) to support broader initiatives like product education, campaign amplification, and lead nurturing?",
      "What is your posting strategy for organic social across all platforms for a B2C company vs a B2B company? How do you handle jumping in on trends on social media & how do you determine social strategies and their effectiveness?",
      "How do you alert clients of social calendars? Who creates the campaign content? Is it in house, freelance or is this something provided to you by clients?",
      "Do you interact with comments, messages, etc on page? Do you interact with other accounts on social? If yes, do you give an overview to clients of conversations/messages/etc?",
      "Do you manage social media in house or is it outsourced? Are your social media services scalable to manage individual franchisee social accounts? If yes, how would your posting optimization strategy differ?",
      "What is your management fee associated with Paid Social Media?",
      "How do you manage success of organic social campaigns?",
      "How do you determine paid social campaigns and success from the campaigns? If something is not performing, how do you adjust?",
      "Provide examples of 2 successful Reddit campaigns (1 B2B and 1 B2C) you have developed and executed, including KPIs achieved and lessons learned?",
      "How would you approach identifying and engaging with the most relevant subreddits for our brands (ATD, Tire Pros, Hercules Tires, Ironman Tires) while maintaining authenticity and adhering to Reddit community guidelines?",
      "How do you recommend balancing organic community engagement with Reddit paid media (Promoted Posts, Display Ads) to drive both brand awareness and conversions?",
      "What KPIs would you use to evaluate the success of our Reddit strategy across both paid and organic efforts?"
    ]
  },
  {
    title: "17. Media Buying",
    page: 602,
    questions: [
      "Speak to the depth and breadth of total media spend under management for all existing clients?",
      "Please provide a brief overview of your agency and media buying capabilities.",
      "How do you develop a media buying strategy?",
      "Can you provide sample dashboards or performance reports?",
      "How do you determine the optimal media mix (TV, radio, print, digital, OOH, etc.)?",
      "What tools or data do you use for audience targeting and media planning?",
      "Do you handle both digital and traditional media buys?",
      "How do you ensure transparency in media costs and markups?",
      "How do you handle mid-campaign optimizations?",
      "How do you ensure cost-efficiency and ROI on media spend?",
      "How do you define and evaluate the success of media buys across CTV/OTT, streaming audio, YouTube, and high-impact display ads?",
      "How would your team approach the development of a paid media strategy that balances reach, engagement, and conversion to drive qualified traffic to the Dealer Locator and 'Find a Dealer' tools?",
      "How do you use performance data to proactively adjust paid media and full-funnel strategies over time, especially if some channels are underperforming vs. goal?",
      "What approach do you take to develop media mix modeling (MMM) that ensures efficient spend across high-impact tactics like CTV/OTT, YouTube, display, and search?",
      "How do you ensure ad placements reach both our core and growth audiences without wasting impressions or overspending on low-performing segments?",
      "How do you monitor performance in real-time and adjust campaigns to improve cost-efficiency?",
      "What tools and processes do you use for A/B testing creative, placements, and bidding strategies across channels?",
      "How do you handle budget pacing to ensure full spend without front- or back-loading the campaign?",
      "What does your RFP process look like for traditional media sources (ex. Broadcast tv, radio, etc)?"
    ]
  }
];

export default questionSections;