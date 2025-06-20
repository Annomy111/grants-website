const axios = require('axios');

async function createBlogPost() {
  const blogContent = `Hey folks, Fedo here. Over three years into Russia's full-scale invasion, Ukrainian civil society remains a critical pillar of the nation's resistance, adaptation, and democratic aspirations. The period of May-June 2025 has been no exception, marked by both profound challenges and inspiring resilience. The sheer scale of the humanitarian crisis is staggering: 12.5 million people are projected to need humanitarian assistance in Ukraine in 2025, with 3.5 million currently internally displaced persons (IDPs). This context underscores the immense operational environment for Civil Society Organizations (CSOs).

We're witnessing a dual reality: the grim backdrop of escalating civilian casualties and the proactive, determined steps being taken to strengthen civil society institutionally, such as the government's new Roadmap for Civil Society Development. This juxtaposition immediately presents a core tension – the simultaneous fight for survival and the unwavering push for a democratic future.

Over the next few minutes, we're going to dive deep into what's been happening on the ground in Ukraine and across Europe with Ukrainian civil society. We'll look at the tough stuff – the humanitarian crises and rights abuses – but also the incredible work being done to push for reforms, protect culture, and keep international support strong. Expect some hard truths, but also some genuinely inspiring stories of action and solidarity. We'll unpack efforts within Ukraine, explore how pro-Ukrainian voices are making themselves heard across Europe, and pinpoint some key trends that tell us a lot about where things might be heading.

<div class="infographic-container" id="key-statistics-infographic"></div>

## Inside Ukraine: Civil Society at the Forefront of Crisis and Reform

Civil Society Organizations (CSOs) operating within Ukraine are performing a multifaceted role, from delivering life-saving aid under fire to championing democratic reforms and safeguarding cultural identity amidst the relentless conflict. Their work in May and June 2025 highlights their adaptability and unwavering commitment.

### The Enduring Humanitarian Challenge & Escalating Civilian Impact

The human cost of the protracted war continues to mount, demanding an enormous and evolving response from humanitarian actors.

#### The Human Cost – Numbers and Needs:

As of early June 2025, more than three years since the full-scale invasion, a staggering 3.8 million individuals remain internally displaced within Ukraine. Alongside this, 4.1 million people have returned to their places of origin, having previously been displaced either internally or from abroad. These figures, highlighted in the International Organization for Migration's (IOM) June 3, 2025 report, "Ukraine — Displacement and Return: Trends, Drivers and Intentions," underscore the protracted nature of the crisis.

<div class="infographic-container" id="displacement-infographic"></div>

The IOM's 2025 Crisis Response Plan paints a stark picture, indicating that 12.5 million people in Ukraine require humanitarian assistance. Among them, 3.5 million are IDPs, with a particularly vulnerable group of over one million residing in frontline areas. The economic fallout of the war is also severe, with the World Bank (2024) reporting that over nine million Ukrainians are living in poverty—an increase of 1.8 million people since February 2022. The damage to energy infrastructure, leading to power outages and fuel shortages, further threatens civilians' access to shelter and basic services, especially during the harsh winter periods.

For the 6.3 million refugees from Ukraine hosted across Europe (as of January 2025), significant challenges persist. IOM surveys conducted in 2024 revealed that 56% need financial support, 49% cannot cover an unexpected €100 expense, and 38% lack access to healthcare. This difficult situation for refugees abroad influences their decisions about returning and shapes the types of support diaspora CSOs provide.

In response to these legal and administrative hurdles, the United Nations High Commissioner for Refugees (UNHCR) continues its vital work providing legal support to displaced people in Ukraine. This assistance is crucial for protecting their rights and restoring a semblance of dignity. Since the onset of the full-scale invasion, UNHCR and its partners have delivered over half a million legal counselling sessions, helping individuals recover lost or damaged documents, obtain proof of property ownership, and navigate the complex bureaucracy to access administrative and social services and benefits.

#### Escalating Civilian Harm:

The early summer months of 2025 brought a grim escalation in harm to civilians. The UN Human Rights Monitoring Mission in Ukraine (HRMMU) reported that April 2025 was the deadliest month for civilians since September 2024. At least 209 civilians were killed and 1,146 injured, with a staggering 97% of these casualties occurring in territory controlled by the Ukrainian government. Nearly half of these resulted from missile and loitering munition attacks. A primary driver for this sharp increase was the intensified use of ballistic missiles against major cities. Tragically, child casualties also saw a spike in April, with 19 children killed and 78 injured—the highest verified monthly number since June 2022. This devastating pattern of attacks on urban centers like Kharkiv, Odesa, Zaporizhzhia, and Kyiv continued into May. Overall, civilian casualties from January to April 2025 were up by 59% compared to the same period in 2024.

<div class="infographic-container" id="civilian-casualties-infographic"></div>

Human Rights Watch (HRW) has provided further chilling details. Their June 3, 2025 report, "Hunted From Above: Russia's Use of Drones to Attack Civilians in Kherson, Ukraine," documents how Russian forces have repeatedly used drones, including inexpensive commercially available models (such as DJI, Autel, and the Russian-made Sudoplatov), to deliberately or recklessly carry out strikes against civilians and civilian objects in Kherson. These attacks, which have spread terror and led to depopulation in targeted areas, also involved targeting healthcare facilities and rescue workers. HRW has characterized these actions as serious violations of the laws of war, potentially amounting to crimes against humanity. Between May and December 2024 alone, drone attacks in Kherson resulted in almost 500 civilian injuries and 30 fatalities. Disturbingly, Russian forces have also utilized these drones to scatter internationally-prohibited PFM antipersonnel landmines in Kherson neighborhoods.

### CSO Humanitarian Response:

Ukrainian CSOs have been at the vanguard of the humanitarian response, demonstrating remarkable agility and dedication.

**Razom for Ukraine** has been exceptionally active in delivering humanitarian aid and medical support. In May and June 2025, their efforts included responding to the intense siege of Kharkiv, providing essential medical backpacks to frontline medics, deploying mobile stabilization points known as "Stabnet," channeling $100,000 in aid to hospitals in Sumy, delivering 11 mobile medical units, and supporting emergency medical training for Ukrainian personnel. They also continued their partnership with The Howard G. Buffett Foundation, focusing on the provision of medical kits and enhancing the emergency response capabilities of Ukrainian services.

**The Serhiy Prytula Charity Foundation** made a significant contribution to Ukraine's defense capabilities. On June 2, 2025, the foundation announced the handover of 38 electronic warfare (EW) systems to the AZOV Brigade. This delivery was part of their "Invisible Shield" fundraising collection, aimed at protecting Ukrainian defenders from drone threats. The foundation also continued its "Invincible When United" European fundraising tour to gather further support.

**IsraAID Ukraine** focused on the psychological well-being of children affected by the war. Between May 22 and May 28, they hosted shelter painting festivals as part of their "Quokka Hub" project. These hubs are designed as child-friendly spaces providing emotional support in villages that previously lacked protective shelters. To date, IsraAID has supported over 400,000 people across Ukraine with a range of aid, including safe water, mental health services, and medical equipment.

<div class="infographic-container" id="cso-response-infographic"></div>

### Strengthening Democracy and Rights Amidst Conflict

Even as the war rages, efforts to bolster Ukraine's democratic institutions and protect human rights continue, with CSOs playing a pivotal role.

#### Government's Civil Society Roadmap:

A significant development was the Ukrainian Cabinet of Ministers' approval on March 21, 2025, of the Action Plan for 2025–2026. This plan is designed to operationalize the National Strategy for the Promotion of Civil Society 2021–2026. It introduces 34 key measures aimed at improving the civic environment and embedding civil society more deeply into local and national decision-making processes. Key initiatives include:

- Introduction of online registration for CSOs through the Diia portal
- Development of model charters to simplify CSO establishment
- Improvements to public consultation mechanisms
- Promotion of school participatory budgets
- Incentives for volunteerism
- Tax incentives for CSOs
- Enhancements to legislation on humanitarian aid
- Creating pathways for CSOs to provide socially important services

<div class="infographic-container" id="roadmap-infographic"></div>

### Cultural Resilience and Identity Preservation

Protecting and promoting Ukrainian cultural identity is a vital front in the nation's struggle, especially given documented Russian efforts to erase Ukrainian culture in occupied territories. Civil society is playing a crucial role in these endeavors.

## The European Front: Pro-Ukrainian Civil Society Mobilization

Across Europe, a vibrant and dedicated network of pro-Ukrainian civil society actors, including diaspora organizations, international NGOs, and grassroots movements, has been tirelessly working to advocate for Ukraine, support its displaced citizens, and contribute to the broader resistance against Russian aggression. The period of May-June 2025 saw these efforts continue with vigor and increasing sophistication.

<div class="infographic-container" id="europe-support-infographic"></div>

### Key Findings and Emerging Trends (May-June 2025)

The activities and developments within Ukrainian civil society, both domestically and across Europe, during May and June 2025 reveal several significant underlying trends:

1. **The Intensifying Dual Pressure on Ukrainian Civil Society**: Escalating frontline demands vs. long-term institutional development
2. **Pro-Ukrainian Advocacy in Europe is Becoming More Sophisticated**: More targeted and confrontational in the narrative space
3. **The Tangible Impact of Technology**: A rapidly evolving arms race in both aggression and civil society response
4. **The "Return Dilemma"**: Balancing Ukraine's need for citizens with refugees' rights and realities in host countries

<div class="infographic-container" id="trends-timeline-infographic"></div>

### Conclusion: The Unbroken Chain of Support and Resilience

Despite the relentless pressures and escalating challenges witnessed during May and June 2025, Ukrainian civil society – operating both within the country under extreme duress and bolstered by a dedicated network of allies across Europe – has once again demonstrated extraordinary resilience, adaptability, and unwavering commitment. Their multifaceted work, spanning from immediate humanitarian relief on the frontlines to strategic advocacy in international forums, from preserving cultural heritage to pushing for democratic reforms, is nothing short of remarkable.

It is clear that their efforts are not merely about coping with the present crisis, however immense. They are actively engaged in shaping a democratic, sovereign, and European future for Ukraine. The road ahead is undoubtedly arduous and fraught with uncertainty. However, if the activities of the past month have shown anything, it is that the spirit of Ukrainian civil society, and the international solidarity that buoys it, remains an unbroken and powerful force. Supporting these organizations, these individuals, and their vital work is not just an act of aid; it is a profound investment in a future where freedom, dignity, and human rights prevail. Let's ensure that chain of support remains strong and unyielding.`;

  const blogPost = {
    title: "Ukraine's Civil Society Pulse: Resilience, Advocacy, and Action (May-June 2025)",
    slug: 'ukraine-civil-society-pulse-may-june-2025',
    content: blogContent,
    excerpt:
      "Over three years into Russia's full-scale invasion, Ukrainian civil society remains a critical pillar of the nation's resistance, adaptation, and democratic aspirations. This comprehensive report examines the challenges and inspiring resilience demonstrated during May-June 2025.",
    category: 'Reports',
    tags: ['Ukraine', 'Civil Society', 'Human Rights', 'Humanitarian Aid', 'EU Integration'],
    status: 'published',
    featured_image: '/images/ukraine-civil-society-hero.jpg',
    author_name: 'Fedo',
    published_at: new Date().toISOString(),
  };

  try {
    // Get auth token
    const authToken = 'eyJ1c2VyIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3Mzg2MDU2ODYxMTZ9'; // Using the hardcoded token

    const response = await axios.post(
      'https://civil-society-grants-database.netlify.app/.netlify/functions/blog',
      blogPost,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Blog post created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating blog post:', error.response?.data || error.message);
  }
}

createBlogPost();
